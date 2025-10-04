-- Create function to get organization team members
CREATE OR REPLACE FUNCTION public.get_org_team_members(_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  email text,
  display_name text,
  avatar_url text,
  roles text[],
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id uuid;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO _org_id
  FROM public.profiles
  WHERE profiles.user_id = _user_id
  LIMIT 1;
  
  IF _org_id IS NULL THEN
    RETURN;
  END IF;

  -- Return all team members with their roles
  RETURN QUERY
  SELECT 
    p.user_id,
    p.email,
    p.display_name,
    p.avatar_url,
    ARRAY_AGG(DISTINCT ur.role::text) as roles,
    p.created_at
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
  WHERE p.organization_id = _org_id
  GROUP BY p.user_id, p.email, p.display_name, p.avatar_url, p.created_at
  ORDER BY p.created_at DESC;
END;
$$;

-- Create function to assign role to user
CREATE OR REPLACE FUNCTION public.assign_user_role(
  _assigner_id uuid,
  _target_user_id uuid,
  _role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id uuid;
BEGIN
  -- Check if assigner has permission (owner or admin)
  IF NOT (has_role(_assigner_id, 'owner') OR has_role(_assigner_id, 'admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Get organization
  SELECT organization_id INTO _org_id
  FROM public.profiles
  WHERE user_id = _assigner_id
  LIMIT 1;

  IF _org_id IS NULL THEN
    RAISE EXCEPTION 'Organization not found';
  END IF;

  -- Verify target user is in same organization
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _target_user_id AND organization_id = _org_id
  ) THEN
    RAISE EXCEPTION 'User not in organization';
  END IF;

  -- Insert or ignore role
  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (_target_user_id, _org_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Create function to remove role from user
CREATE OR REPLACE FUNCTION public.remove_user_role(
  _remover_id uuid,
  _target_user_id uuid,
  _role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if remover has permission (owner or admin)
  IF NOT (has_role(_remover_id, 'owner') OR has_role(_remover_id, 'admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Don't allow removing owner role from owners
  IF _role = 'owner' AND has_role(_remover_id, 'owner') THEN
    RAISE EXCEPTION 'Cannot remove owner role';
  END IF;

  -- Remove role
  DELETE FROM public.user_roles
  WHERE user_id = _target_user_id AND role = _role;
END;
$$;

-- Create function to remove user from organization
CREATE OR REPLACE FUNCTION public.remove_org_member(
  _remover_id uuid,
  _target_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id uuid;
BEGIN
  -- Check if remover has permission (owner or admin)
  IF NOT (has_role(_remover_id, 'owner') OR has_role(_remover_id, 'admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Get organization
  SELECT organization_id INTO _org_id
  FROM public.profiles
  WHERE user_id = _remover_id
  LIMIT 1;

  -- Don't allow removing owners
  IF has_role(_target_user_id, 'owner') THEN
    RAISE EXCEPTION 'Cannot remove owner';
  END IF;

  -- Remove all roles
  DELETE FROM public.user_roles
  WHERE user_id = _target_user_id AND organization_id = _org_id;

  -- Remove from organization (set organization_id to null)
  UPDATE public.profiles
  SET organization_id = NULL
  WHERE user_id = _target_user_id AND organization_id = _org_id;
END;
$$;