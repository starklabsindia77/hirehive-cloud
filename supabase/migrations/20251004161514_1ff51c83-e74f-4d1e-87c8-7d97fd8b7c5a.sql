-- Add subdomain field to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS subdomain TEXT UNIQUE;

-- Add check constraint for subdomain format (lowercase alphanumeric and hyphens only)
ALTER TABLE public.organizations
ADD CONSTRAINT subdomain_format_check 
CHECK (subdomain ~* '^[a-z0-9]+(-[a-z0-9]+)*$');

COMMENT ON COLUMN public.organizations.subdomain IS 'Organization subdomain for custom branding (e.g., acme.nexhire.com)';

-- Create index for faster subdomain lookups
CREATE INDEX IF NOT EXISTS idx_organizations_subdomain ON public.organizations(subdomain);

-- Function to check if subdomain is available
CREATE OR REPLACE FUNCTION public.is_subdomain_available(_subdomain TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.organizations WHERE subdomain = LOWER(_subdomain)
  );
$$;

-- Function to update organization subdomain (only owners/admins)
CREATE OR REPLACE FUNCTION public.update_organization_subdomain(_org_id UUID, _subdomain TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO _user_org_id
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1;

  -- Check if user belongs to the organization
  IF _user_org_id != _org_id THEN
    RAISE EXCEPTION 'User does not belong to this organization';
  END IF;

  -- Check if user has permission (owner or admin)
  IF NOT (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions to update subdomain';
  END IF;

  -- Validate subdomain format
  IF _subdomain !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
    RAISE EXCEPTION 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens.';
  END IF;

  -- Check if subdomain is already taken
  IF NOT is_subdomain_available(_subdomain) THEN
    RAISE EXCEPTION 'Subdomain is already taken';
  END IF;

  -- Update subdomain
  UPDATE public.organizations
  SET subdomain = LOWER(_subdomain)
  WHERE id = _org_id;
END;
$$;

-- Function to get organization by subdomain (public access for routing)
CREATE OR REPLACE FUNCTION public.get_organization_by_subdomain(_subdomain TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  brand_name TEXT,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  subdomain TEXT,
  schema_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, name, brand_name, logo_url, primary_color, secondary_color, subdomain, schema_name
  FROM public.organizations
  WHERE subdomain = LOWER(_subdomain)
  LIMIT 1;
$$;