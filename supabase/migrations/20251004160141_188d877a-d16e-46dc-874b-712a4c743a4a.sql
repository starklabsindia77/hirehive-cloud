-- SSO configurations per organization
CREATE TABLE IF NOT EXISTS public.sso_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  provider TEXT NOT NULL, -- 'google', 'microsoft', 'okta', 'saml'
  is_enabled BOOLEAN DEFAULT false,
  
  -- OAuth settings
  client_id TEXT,
  client_secret TEXT,
  
  -- SAML settings
  metadata_xml TEXT,
  issuer_url TEXT,
  sso_url TEXT,
  certificate TEXT,
  
  -- Configuration
  force_sso BOOLEAN DEFAULT false, -- require SSO for all users
  auto_provision BOOLEAN DEFAULT true, -- auto-create users on first login
  default_role TEXT DEFAULT 'viewer',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  configured_by UUID
);

-- SSO session mapping
CREATE TABLE IF NOT EXISTS public.sso_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_id TEXT, -- ID from SSO provider
  session_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sso_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sso_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sso_configurations
CREATE POLICY "Owners and admins can view SSO config"
  ON public.sso_configurations FOR SELECT
  USING (
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Owners can manage SSO config"
  ON public.sso_configurations FOR ALL
  USING (
    has_role(auth.uid(), 'owner') OR
    has_role(auth.uid(), 'super_admin')
  );

-- RLS Policies for sso_sessions
CREATE POLICY "Users can view their own SSO sessions"
  ON public.sso_sessions FOR SELECT
  USING (user_id = auth.uid());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_sso_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sso_configurations_timestamp
  BEFORE UPDATE ON public.sso_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_sso_configurations_updated_at();

-- Create indexes
CREATE INDEX idx_sso_sessions_user ON public.sso_sessions(user_id);
CREATE INDEX idx_sso_sessions_org ON public.sso_sessions(organization_id);