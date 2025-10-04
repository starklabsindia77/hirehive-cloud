-- Create permissions table for granular access control
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(resource, action)
);

-- Create role permissions mapping
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Create user permission overrides
CREATE TABLE IF NOT EXISTS public.user_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  granted_by UUID,
  UNIQUE(user_id, organization_id, permission_id)
);

-- Enable RLS on new tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permission_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permissions (readable by all authenticated users)
CREATE POLICY "Permissions are viewable by authenticated users"
  ON public.permissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Role permissions are viewable by authenticated users"
  ON public.role_permissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for user permission overrides
CREATE POLICY "Users can view permission overrides in their organization"
  ON public.user_permission_overrides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.organization_id = user_permission_overrides.organization_id
    )
  );

CREATE POLICY "Admins can manage permission overrides"
  ON public.user_permission_overrides FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'owner') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID,
  _resource TEXT,
  _action TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _permission_id UUID;
  _user_role app_role;
  _org_id UUID;
  _override_exists BOOLEAN;
  _is_granted BOOLEAN;
BEGIN
  -- Get user's role and organization
  SELECT profiles.role, profiles.organization_id INTO _user_role, _org_id
  FROM public.profiles
  WHERE profiles.user_id = _user_id;

  -- Super admin has all permissions
  IF _user_role = 'super_admin' THEN
    RETURN true;
  END IF;

  -- Get permission ID
  SELECT id INTO _permission_id
  FROM public.permissions
  WHERE resource = _resource AND action = _action;

  IF _permission_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check for user-specific override first
  SELECT EXISTS(
    SELECT 1 FROM public.user_permission_overrides
    WHERE user_id = _user_id
    AND organization_id = _org_id
    AND permission_id = _permission_id
  ) INTO _override_exists;

  IF _override_exists THEN
    SELECT is_granted INTO _is_granted
    FROM public.user_permission_overrides
    WHERE user_id = _user_id
    AND organization_id = _org_id
    AND permission_id = _permission_id;
    
    RETURN _is_granted;
  END IF;

  -- Check role-based permissions
  RETURN EXISTS(
    SELECT 1 FROM public.role_permissions
    WHERE role = _user_role
    AND permission_id = _permission_id
  );
END;
$$;

-- Function to get all permissions for a user
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID)
RETURNS TABLE(
  resource TEXT,
  action TEXT,
  description TEXT,
  source TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_role app_role;
  _org_id UUID;
BEGIN
  -- Get user's role and organization
  SELECT profiles.role, profiles.organization_id INTO _user_role, _org_id
  FROM public.profiles
  WHERE profiles.user_id = _user_id;

  -- Super admin gets all permissions
  IF _user_role = 'super_admin' THEN
    RETURN QUERY
    SELECT p.resource, p.action, p.description, 'super_admin'::TEXT as source
    FROM public.permissions p;
    RETURN;
  END IF;

  -- Return role-based permissions plus overrides
  RETURN QUERY
  SELECT DISTINCT
    p.resource,
    p.action,
    p.description,
    CASE
      WHEN upo.id IS NOT NULL THEN 
        CASE WHEN upo.is_granted THEN 'user_granted' ELSE 'user_revoked' END
      ELSE 'role'
    END as source
  FROM public.permissions p
  LEFT JOIN public.role_permissions rp ON rp.permission_id = p.id AND rp.role = _user_role
  LEFT JOIN public.user_permission_overrides upo ON upo.permission_id = p.id 
    AND upo.user_id = _user_id 
    AND upo.organization_id = _org_id
  WHERE (rp.id IS NOT NULL AND (upo.id IS NULL OR upo.is_granted = true))
     OR (upo.id IS NOT NULL AND upo.is_granted = true);
END;
$$;

-- Insert default permissions for common resources
INSERT INTO public.permissions (resource, action, description) VALUES
  -- Candidates
  ('candidates', 'create', 'Create new candidates'),
  ('candidates', 'read', 'View candidate details'),
  ('candidates', 'update', 'Edit candidate information'),
  ('candidates', 'delete', 'Delete candidates'),
  ('candidates', 'export', 'Export candidate data'),
  ('candidates', 'bulk_action', 'Perform bulk operations on candidates'),
  
  -- Jobs
  ('jobs', 'create', 'Create new job postings'),
  ('jobs', 'read', 'View job details'),
  ('jobs', 'update', 'Edit job postings'),
  ('jobs', 'delete', 'Delete job postings'),
  ('jobs', 'publish', 'Publish jobs to careers page'),
  
  -- Applications
  ('applications', 'create', 'Create applications'),
  ('applications', 'read', 'View applications'),
  ('applications', 'update', 'Update application status'),
  ('applications', 'delete', 'Delete applications'),
  
  -- Interviews
  ('interviews', 'create', 'Schedule interviews'),
  ('interviews', 'read', 'View interview details'),
  ('interviews', 'update', 'Reschedule or update interviews'),
  ('interviews', 'delete', 'Cancel interviews'),
  
  -- Offers
  ('offers', 'create', 'Generate offer letters'),
  ('offers', 'read', 'View offer details'),
  ('offers', 'update', 'Edit offers'),
  ('offers', 'delete', 'Revoke offers'),
  ('offers', 'send', 'Send offers to candidates'),
  
  -- Team
  ('team', 'invite', 'Invite team members'),
  ('team', 'read', 'View team members'),
  ('team', 'update', 'Edit team member roles'),
  ('team', 'remove', 'Remove team members'),
  
  -- Settings
  ('settings', 'read', 'View organization settings'),
  ('settings', 'update', 'Modify organization settings'),
  
  -- Analytics
  ('analytics', 'read', 'View analytics and reports'),
  ('analytics', 'export', 'Export analytics data'),
  
  -- Email Templates
  ('email_templates', 'create', 'Create email templates'),
  ('email_templates', 'read', 'View email templates'),
  ('email_templates', 'update', 'Edit email templates'),
  ('email_templates', 'delete', 'Delete email templates');

-- Assign default permissions to roles
-- Owner: All permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'owner'::app_role, id FROM public.permissions;

-- Admin: All permissions except team removal and critical settings
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::app_role, id FROM public.permissions
WHERE NOT (resource = 'team' AND action = 'remove');

-- Recruiter: Core recruiting functions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'recruiter'::app_role, id FROM public.permissions
WHERE resource IN ('candidates', 'jobs', 'applications', 'interviews', 'offers', 'email_templates')
  AND action IN ('create', 'read', 'update', 'send');

-- Hiring Manager: View and interview permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'hiring_manager'::app_role, id FROM public.permissions
WHERE (resource IN ('candidates', 'jobs', 'applications') AND action = 'read')
   OR (resource = 'interviews' AND action IN ('create', 'read', 'update'));

-- Viewer: Read-only access
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'viewer'::app_role, id FROM public.permissions
WHERE action = 'read';

-- Create trigger for updated_at on user_permission_overrides
CREATE OR REPLACE FUNCTION update_user_permission_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_permission_overrides_timestamp
  BEFORE UPDATE ON public.user_permission_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_user_permission_overrides_updated_at();