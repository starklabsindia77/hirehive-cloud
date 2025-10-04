-- Create enum for usage types
CREATE TYPE public.usage_type AS ENUM (
  'ai_parse_resume',
  'ai_generate_job_desc',
  'ai_match_candidates',
  'email_send',
  'email_bulk_send',
  'storage_upload'
);

-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM (
  'active',
  'cancelled',
  'expired',
  'trial'
);

-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2) NOT NULL,
  ai_tokens_monthly INTEGER NOT NULL,
  email_credits_monthly INTEGER NOT NULL,
  storage_gb INTEGER NOT NULL,
  team_members_limit INTEGER NOT NULL,
  jobs_limit INTEGER NOT NULL,
  candidates_limit INTEGER NOT NULL,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create organization_subscriptions table
CREATE TABLE public.organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status subscription_status NOT NULL DEFAULT 'trial',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create usage_tracking table
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID,
  usage_type usage_type NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  bytes_used BIGINT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create organization_usage_summary table
CREATE TABLE public.organization_usage_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  total_ai_tokens INTEGER DEFAULT 0,
  total_email_credits INTEGER DEFAULT 0,
  total_storage_bytes BIGINT DEFAULT 0,
  ai_tokens_remaining INTEGER DEFAULT 0,
  email_credits_remaining INTEGER DEFAULT 0,
  storage_bytes_remaining BIGINT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, period_start)
);

-- Add columns to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS current_subscription_id UUID REFERENCES public.organization_subscriptions(id),
ADD COLUMN IF NOT EXISTS billing_email TEXT,
ADD COLUMN IF NOT EXISTS payment_method_id TEXT;

-- Create indexes for better performance
CREATE INDEX idx_usage_tracking_org ON public.usage_tracking(organization_id, created_at DESC);
CREATE INDEX idx_usage_tracking_type ON public.usage_tracking(usage_type);
CREATE INDEX idx_org_subscriptions_org ON public.organization_subscriptions(organization_id);
CREATE INDEX idx_usage_summary_org ON public.organization_usage_summary(organization_id);

-- Trigger for updated_at on subscription_plans
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on organization_subscriptions
CREATE TRIGGER update_organization_subscriptions_updated_at
BEFORE UPDATE ON public.organization_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get organization usage
CREATE OR REPLACE FUNCTION public.get_organization_usage(
  _org_id UUID,
  _period_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  _period_end TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE(
  usage_type usage_type,
  total_tokens INTEGER,
  total_credits INTEGER,
  total_bytes BIGINT,
  count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _period_start IS NULL THEN
    _period_start := date_trunc('month', now());
  END IF;
  
  IF _period_end IS NULL THEN
    _period_end := now();
  END IF;

  RETURN QUERY
  SELECT 
    ut.usage_type,
    COALESCE(SUM(ut.tokens_used), 0)::INTEGER as total_tokens,
    COALESCE(SUM(ut.credits_used), 0)::INTEGER as total_credits,
    COALESCE(SUM(ut.bytes_used), 0)::BIGINT as total_bytes,
    COUNT(*)::BIGINT as count
  FROM public.usage_tracking ut
  WHERE ut.organization_id = _org_id
    AND ut.created_at >= _period_start
    AND ut.created_at <= _period_end
  GROUP BY ut.usage_type;
END;
$$;

-- Function to check usage limits
CREATE OR REPLACE FUNCTION public.check_usage_limit(
  _org_id UUID,
  _usage_type usage_type,
  _amount INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _summary RECORD;
  _plan RECORD;
  _result JSONB;
BEGIN
  -- Get current usage summary
  SELECT * INTO _summary
  FROM public.organization_usage_summary
  WHERE organization_id = _org_id
    AND period_start <= now()
    AND period_end >= now()
  LIMIT 1;

  -- Get plan limits
  SELECT sp.* INTO _plan
  FROM public.organizations o
  JOIN public.organization_subscriptions os ON o.current_subscription_id = os.id
  JOIN public.subscription_plans sp ON os.plan_id = sp.id
  WHERE o.id = _org_id;

  -- If no summary exists, create one
  IF _summary IS NULL THEN
    INSERT INTO public.organization_usage_summary (
      organization_id,
      period_start,
      period_end,
      ai_tokens_remaining,
      email_credits_remaining,
      storage_bytes_remaining
    ) VALUES (
      _org_id,
      date_trunc('month', now()),
      date_trunc('month', now()) + INTERVAL '1 month',
      COALESCE(_plan.ai_tokens_monthly, 0),
      COALESCE(_plan.email_credits_monthly, 0),
      COALESCE(_plan.storage_gb, 0) * 1073741824
    )
    RETURNING * INTO _summary;
  END IF;

  -- Check limits based on usage type
  IF _usage_type IN ('ai_parse_resume', 'ai_generate_job_desc', 'ai_match_candidates') THEN
    _result := jsonb_build_object(
      'allowed', _summary.ai_tokens_remaining >= _amount,
      'remaining', _summary.ai_tokens_remaining,
      'limit', COALESCE(_plan.ai_tokens_monthly, 0),
      'type', 'ai_tokens'
    );
  ELSIF _usage_type IN ('email_send', 'email_bulk_send') THEN
    _result := jsonb_build_object(
      'allowed', _summary.email_credits_remaining >= _amount,
      'remaining', _summary.email_credits_remaining,
      'limit', COALESCE(_plan.email_credits_monthly, 0),
      'type', 'email_credits'
    );
  ELSIF _usage_type = 'storage_upload' THEN
    _result := jsonb_build_object(
      'allowed', _summary.storage_bytes_remaining >= _amount,
      'remaining', _summary.storage_bytes_remaining,
      'limit', COALESCE(_plan.storage_gb, 0) * 1073741824,
      'type', 'storage'
    );
  END IF;

  RETURN _result;
END;
$$;

-- Function to record usage
CREATE OR REPLACE FUNCTION public.record_usage(
  _org_id UUID,
  _user_id UUID,
  _usage_type usage_type,
  _tokens INTEGER DEFAULT 0,
  _credits INTEGER DEFAULT 0,
  _bytes BIGINT DEFAULT 0,
  _metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _usage_id UUID;
BEGIN
  -- Insert usage record
  INSERT INTO public.usage_tracking (
    organization_id,
    user_id,
    usage_type,
    tokens_used,
    credits_used,
    bytes_used,
    metadata
  ) VALUES (
    _org_id,
    _user_id,
    _usage_type,
    _tokens,
    _credits,
    _bytes,
    _metadata
  )
  RETURNING id INTO _usage_id;

  -- Update usage summary
  UPDATE public.organization_usage_summary
  SET 
    total_ai_tokens = total_ai_tokens + _tokens,
    total_email_credits = total_email_credits + _credits,
    total_storage_bytes = total_storage_bytes + _bytes,
    ai_tokens_remaining = GREATEST(ai_tokens_remaining - _tokens, 0),
    email_credits_remaining = GREATEST(email_credits_remaining - _credits, 0),
    storage_bytes_remaining = GREATEST(storage_bytes_remaining - _bytes, 0),
    last_updated = now()
  WHERE organization_id = _org_id
    AND period_start <= now()
    AND period_end >= now();

  RETURN _usage_id;
END;
$$;

-- Function to get usage summary
CREATE OR REPLACE FUNCTION public.get_usage_summary(_org_id UUID)
RETURNS TABLE(
  ai_tokens_used INTEGER,
  ai_tokens_remaining INTEGER,
  ai_tokens_limit INTEGER,
  email_credits_used INTEGER,
  email_credits_remaining INTEGER,
  email_credits_limit INTEGER,
  storage_bytes_used BIGINT,
  storage_bytes_remaining BIGINT,
  storage_bytes_limit BIGINT,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _plan RECORD;
BEGIN
  -- Get plan limits
  SELECT sp.* INTO _plan
  FROM public.organizations o
  JOIN public.organization_subscriptions os ON o.current_subscription_id = os.id
  JOIN public.subscription_plans sp ON os.plan_id = sp.id
  WHERE o.id = _org_id;

  RETURN QUERY
  SELECT 
    ous.total_ai_tokens,
    ous.ai_tokens_remaining,
    COALESCE(_plan.ai_tokens_monthly, 0),
    ous.total_email_credits,
    ous.email_credits_remaining,
    COALESCE(_plan.email_credits_monthly, 0),
    ous.total_storage_bytes,
    ous.storage_bytes_remaining,
    COALESCE(_plan.storage_gb, 0)::BIGINT * 1073741824,
    ous.period_start,
    ous.period_end
  FROM public.organization_usage_summary ous
  WHERE ous.organization_id = _org_id
    AND ous.period_start <= now()
    AND ous.period_end >= now()
  LIMIT 1;
END;
$$;

-- Function to get available plans
CREATE OR REPLACE FUNCTION public.get_available_plans()
RETURNS SETOF public.subscription_plans
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.subscription_plans
  WHERE is_active = true
  ORDER BY price_monthly ASC;
$$;

-- Function to upgrade subscription
CREATE OR REPLACE FUNCTION public.upgrade_subscription(
  _org_id UUID,
  _new_plan_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_subscription_id UUID;
  _new_plan RECORD;
BEGIN
  -- Get new plan details
  SELECT * INTO _new_plan
  FROM public.subscription_plans
  WHERE id = _new_plan_id;

  -- Cancel current subscription
  UPDATE public.organization_subscriptions
  SET 
    status = 'cancelled',
    cancelled_at = now()
  WHERE organization_id = _org_id
    AND status = 'active';

  -- Create new subscription
  INSERT INTO public.organization_subscriptions (
    organization_id,
    plan_id,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    _org_id,
    _new_plan_id,
    'active',
    now(),
    now() + INTERVAL '30 days'
  )
  RETURNING id INTO _new_subscription_id;

  -- Update organization
  UPDATE public.organizations
  SET current_subscription_id = _new_subscription_id
  WHERE id = _org_id;

  -- Reset usage summary with new limits
  UPDATE public.organization_usage_summary
  SET 
    ai_tokens_remaining = _new_plan.ai_tokens_monthly,
    email_credits_remaining = _new_plan.email_credits_monthly,
    storage_bytes_remaining = _new_plan.storage_gb::BIGINT * 1073741824
  WHERE organization_id = _org_id
    AND period_start <= now()
    AND period_end >= now();

  RETURN _new_subscription_id;
END;
$$;

-- Enable RLS on new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_usage_summary ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_plans (everyone can view active plans)
CREATE POLICY "Anyone can view active subscription plans"
ON public.subscription_plans
FOR SELECT
TO authenticated
USING (is_active = true);

-- RLS policies for organization_subscriptions
CREATE POLICY "Users can view their organization subscription"
ON public.organization_subscriptions
FOR SELECT
TO authenticated
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Owners can update organization subscription"
ON public.organization_subscriptions
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'owner') 
  AND organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS policies for usage_tracking
CREATE POLICY "Users can view their organization usage"
ON public.usage_tracking
FOR SELECT
TO authenticated
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
));

-- RLS policies for organization_usage_summary
CREATE POLICY "Users can view their organization usage summary"
ON public.organization_usage_summary
FOR SELECT
TO authenticated
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
));

-- Seed default subscription plans
INSERT INTO public.subscription_plans (name, price_monthly, price_yearly, ai_tokens_monthly, email_credits_monthly, storage_gb, team_members_limit, jobs_limit, candidates_limit, features) VALUES
('Free', 0, 0, 1000, 50, 1, 2, 3, 50, '{"advanced_analytics": false, "custom_branding": false, "priority_support": false}'),
('Starter', 29, 290, 10000, 500, 10, 5, 20, 500, '{"advanced_analytics": true, "custom_branding": false, "priority_support": false}'),
('Professional', 99, 990, 50000, 2000, 50, 20, 999999, 5000, '{"advanced_analytics": true, "custom_branding": true, "priority_support": true}'),
('Enterprise', 299, 2990, 200000, 10000, 200, 999999, 999999, 999999, '{"advanced_analytics": true, "custom_branding": true, "priority_support": true, "dedicated_account_manager": true}');

-- Create default subscriptions for existing organizations (Free plan)
INSERT INTO public.organization_subscriptions (organization_id, plan_id, status, current_period_start, current_period_end, trial_ends_at)
SELECT 
  o.id,
  (SELECT id FROM public.subscription_plans WHERE name = 'Free' LIMIT 1),
  'trial',
  now(),
  now() + INTERVAL '30 days',
  now() + INTERVAL '14 days'
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.organization_subscriptions os WHERE os.organization_id = o.id
);

-- Update organizations with subscription_id
UPDATE public.organizations o
SET current_subscription_id = (
  SELECT id FROM public.organization_subscriptions 
  WHERE organization_id = o.id 
  ORDER BY created_at DESC 
  LIMIT 1
)
WHERE current_subscription_id IS NULL;

-- Create initial usage summaries for all organizations
INSERT INTO public.organization_usage_summary (
  organization_id,
  period_start,
  period_end,
  ai_tokens_remaining,
  email_credits_remaining,
  storage_bytes_remaining
)
SELECT 
  o.id,
  date_trunc('month', now()),
  date_trunc('month', now()) + INTERVAL '1 month',
  sp.ai_tokens_monthly,
  sp.email_credits_monthly,
  sp.storage_gb::BIGINT * 1073741824
FROM public.organizations o
JOIN public.organization_subscriptions os ON o.current_subscription_id = os.id
JOIN public.subscription_plans sp ON os.plan_id = sp.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.organization_usage_summary ous 
  WHERE ous.organization_id = o.id
);