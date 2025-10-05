-- Create platform secrets table
CREATE TABLE IF NOT EXISTS public.platform_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL UNIQUE,
  key_value TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_secrets ENABLE ROW LEVEL SECURITY;

-- Only super admins can view secrets
CREATE POLICY "Super admins can view all secrets"
  ON public.platform_secrets
  FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'));

-- Only super admins can insert secrets
CREATE POLICY "Super admins can insert secrets"
  ON public.platform_secrets
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Only super admins can update secrets
CREATE POLICY "Super admins can update secrets"
  ON public.platform_secrets
  FOR UPDATE
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Only super admins can delete secrets
CREATE POLICY "Super admins can delete secrets"
  ON public.platform_secrets
  FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));

-- Function to get a secret value (security definer to bypass RLS in edge functions)
CREATE OR REPLACE FUNCTION public.get_platform_secret(_key_name TEXT)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT key_value
  FROM public.platform_secrets
  WHERE key_name = _key_name
    AND is_active = true
  LIMIT 1;
$$;

-- Function to set/update a secret
CREATE OR REPLACE FUNCTION public.set_platform_secret(
  _key_name TEXT,
  _key_value TEXT,
  _description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _secret_id UUID;
BEGIN
  -- Check if user is super admin
  IF NOT has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Upsert secret
  INSERT INTO public.platform_secrets (key_name, key_value, description, created_by, updated_by)
  VALUES (_key_name, _key_value, _description, auth.uid(), auth.uid())
  ON CONFLICT (key_name)
  DO UPDATE SET
    key_value = _key_value,
    description = COALESCE(_description, platform_secrets.description),
    updated_by = auth.uid(),
    updated_at = now()
  RETURNING id INTO _secret_id;

  RETURN _secret_id;
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_platform_secrets_updated_at
  BEFORE UPDATE ON public.platform_secrets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert common secret placeholders
INSERT INTO public.platform_secrets (key_name, key_value, description, is_active)
VALUES 
  ('OPENAI_API_KEY', '', 'OpenAI API key for AI features', false),
  ('LOVABLE_API_KEY', '', 'Lovable AI Gateway API key', false),
  ('SMTP_HOST', '', 'SMTP server host for email sending', false),
  ('SMTP_PORT', '', 'SMTP server port', false),
  ('SMTP_USER', '', 'SMTP username', false),
  ('SMTP_PASSWORD', '', 'SMTP password', false)
ON CONFLICT (key_name) DO NOTHING;