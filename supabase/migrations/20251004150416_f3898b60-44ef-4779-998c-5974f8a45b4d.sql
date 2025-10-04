-- Add feature management for organizations
CREATE TABLE IF NOT EXISTS public.organization_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  custom_limit INTEGER,
  notes TEXT,
  enabled_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, feature_key)
);

-- Add custom plans flag to subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Enable RLS
ALTER TABLE public.organization_features ENABLE ROW LEVEL SECURITY;

-- Create policies for organization_features
CREATE POLICY "Super admins can view all organization features"
ON public.organization_features
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert organization features"
ON public.organization_features
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update organization features"
ON public.organization_features
FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete organization features"
ON public.organization_features
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Organizations can view their own features"
ON public.organization_features
FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
));

-- Update subscription_plans policies for custom plans
DROP POLICY IF EXISTS "Super admins can manage plans" ON public.subscription_plans;

CREATE POLICY "Super admins can view all plans"
ON public.subscription_plans
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can create plans"
ON public.subscription_plans
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update plans"
ON public.subscription_plans
FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete plans"
ON public.subscription_plans
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_organization_features_updated_at
BEFORE UPDATE ON public.organization_features
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to toggle organization feature
CREATE OR REPLACE FUNCTION public.toggle_organization_feature(
  _organization_id UUID,
  _feature_key TEXT,
  _is_enabled BOOLEAN,
  _custom_limit INTEGER DEFAULT NULL,
  _notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _feature_id UUID;
BEGIN
  -- Check if user is super admin
  IF NOT has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Upsert feature
  INSERT INTO public.organization_features (
    organization_id, feature_key, is_enabled, custom_limit, notes, enabled_by
  ) VALUES (
    _organization_id, _feature_key, _is_enabled, _custom_limit, _notes, auth.uid()
  )
  ON CONFLICT (organization_id, feature_key)
  DO UPDATE SET
    is_enabled = _is_enabled,
    custom_limit = _custom_limit,
    notes = _notes,
    enabled_by = auth.uid(),
    updated_at = now()
  RETURNING id INTO _feature_id;

  RETURN _feature_id;
END;
$$;

-- Create function to create custom enterprise plan
CREATE OR REPLACE FUNCTION public.create_custom_plan(
  _organization_id UUID,
  _name TEXT,
  _price_monthly NUMERIC,
  _price_yearly NUMERIC,
  _ai_tokens_monthly INTEGER,
  _email_credits_monthly INTEGER,
  _storage_gb INTEGER,
  _team_members_limit INTEGER,
  _jobs_limit INTEGER,
  _candidates_limit INTEGER,
  _features JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _plan_id UUID;
  _subscription_id UUID;
BEGIN
  -- Check if user is super admin
  IF NOT has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Create custom plan
  INSERT INTO public.subscription_plans (
    name, price_monthly, price_yearly, ai_tokens_monthly, email_credits_monthly,
    storage_gb, team_members_limit, jobs_limit, candidates_limit, features,
    is_custom, organization_id, is_active
  ) VALUES (
    _name, _price_monthly, _price_yearly, _ai_tokens_monthly, _email_credits_monthly,
    _storage_gb, _team_members_limit, _jobs_limit, _candidates_limit, _features,
    true, _organization_id, true
  )
  RETURNING id INTO _plan_id;

  -- Cancel existing subscription
  UPDATE public.organization_subscriptions
  SET status = 'cancelled', cancelled_at = now()
  WHERE organization_id = _organization_id AND status = 'active';

  -- Create new subscription with custom plan
  INSERT INTO public.organization_subscriptions (
    organization_id, plan_id, status, current_period_start, current_period_end
  ) VALUES (
    _organization_id, _plan_id, 'active', now(), now() + INTERVAL '30 days'
  )
  RETURNING id INTO _subscription_id;

  -- Update organization's current subscription
  UPDATE public.organizations
  SET current_subscription_id = _subscription_id
  WHERE id = _organization_id;

  -- Reset usage limits
  UPDATE public.organization_usage_summary
  SET
    ai_tokens_remaining = _ai_tokens_monthly,
    email_credits_remaining = _email_credits_monthly,
    storage_bytes_remaining = _storage_gb::BIGINT * 1073741824,
    last_updated = now()
  WHERE organization_id = _organization_id
    AND period_start <= now()
    AND period_end >= now();

  RETURN _plan_id;
END;
$$;

-- Create function to get all organizations for super admin
CREATE OR REPLACE FUNCTION public.get_all_organizations()
RETURNS TABLE(
  id UUID, name TEXT, schema_name TEXT, brand_name TEXT, logo_url TEXT,
  primary_color TEXT, secondary_color TEXT, created_at TIMESTAMP WITH TIME ZONE,
  current_subscription_id UUID, plan_name TEXT, plan_price NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is super admin
  IF NOT has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT 
    o.id, o.name, o.schema_name, o.brand_name, o.logo_url,
    o.primary_color, o.secondary_color, o.created_at,
    o.current_subscription_id, sp.name as plan_name, sp.price_monthly as plan_price
  FROM public.organizations o
  LEFT JOIN public.organization_subscriptions os ON o.current_subscription_id = os.id
  LEFT JOIN public.subscription_plans sp ON os.plan_id = sp.id
  ORDER BY o.created_at DESC;
END;
$$;

-- Create function to get organization features
CREATE OR REPLACE FUNCTION public.get_organization_features(_organization_id UUID)
RETURNS TABLE(
  id UUID, organization_id UUID, feature_key TEXT, is_enabled BOOLEAN,
  custom_limit INTEGER, notes TEXT, enabled_by UUID,
  created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is super admin
  IF NOT has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT 
    of.id, of.organization_id, of.feature_key, of.is_enabled,
    of.custom_limit, of.notes, of.enabled_by,
    of.created_at, of.updated_at
  FROM public.organization_features of
  WHERE of.organization_id = _organization_id
  ORDER BY of.created_at DESC;
END;
$$;