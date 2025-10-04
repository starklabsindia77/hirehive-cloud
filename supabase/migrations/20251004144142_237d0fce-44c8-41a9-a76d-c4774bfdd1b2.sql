-- Add career portal branding fields to organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS company_description TEXT,
ADD COLUMN IF NOT EXISTS careers_tagline TEXT,
ADD COLUMN IF NOT EXISTS careers_banner_url TEXT,
ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_css TEXT,
ADD COLUMN IF NOT EXISTS show_team_size BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_location BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_public_jobs(text);
DROP FUNCTION IF EXISTS public.get_public_job(uuid);

-- Create get_public_jobs function with all branding fields
CREATE FUNCTION public.get_public_jobs(_org_schema text DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  title text,
  department text,
  location text,
  employment_type text,
  description text,
  requirements text,
  status text,
  created_at timestamp with time zone,
  organization_name text,
  organization_id uuid,
  brand_name text,
  logo_url text,
  primary_color text,
  secondary_color text,
  company_description text,
  careers_tagline text,
  careers_banner_url text,
  social_links jsonb,
  show_team_size boolean,
  show_location boolean,
  custom_css text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name text;
BEGIN
  IF _org_schema IS NOT NULL THEN
    RETURN QUERY EXECUTE format('
      SELECT j.id, j.title, j.department, j.location, j.employment_type,
             j.description, j.requirements, j.status, j.created_at,
             o.name as organization_name, o.id as organization_id,
             o.brand_name, o.logo_url, o.primary_color, o.secondary_color,
             o.company_description, o.careers_tagline, o.careers_banner_url,
             o.social_links, o.show_team_size, o.show_location, o.custom_css
      FROM %I.jobs j
      JOIN public.organizations o ON o.schema_name = %L
      WHERE j.status = ''open''
      ORDER BY j.created_at DESC
    ', _org_schema, _org_schema);
  ELSE
    FOR _schema_name IN 
      SELECT schema_name FROM public.organizations
    LOOP
      RETURN QUERY EXECUTE format('
        SELECT j.id, j.title, j.department, j.location, j.employment_type,
               j.description, j.requirements, j.status, j.created_at,
               o.name as organization_name, o.id as organization_id,
               o.brand_name, o.logo_url, o.primary_color, o.secondary_color,
               o.company_description, o.careers_tagline, o.careers_banner_url,
               o.social_links, o.show_team_size, o.show_location, o.custom_css
        FROM %I.jobs j
        JOIN public.organizations o ON o.schema_name = %L
        WHERE j.status = ''open''
        ORDER BY j.created_at DESC
      ', _schema_name, _schema_name);
    END LOOP;
  END IF;
END;
$$;

-- Create get_public_job function with all branding fields
CREATE FUNCTION public.get_public_job(_job_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  department text,
  location text,
  employment_type text,
  description text,
  requirements text,
  status text,
  created_at timestamp with time zone,
  organization_name text,
  organization_id uuid,
  organization_schema text,
  brand_name text,
  logo_url text,
  primary_color text,
  secondary_color text,
  company_description text,
  careers_tagline text,
  careers_banner_url text,
  social_links jsonb,
  show_team_size boolean,
  show_location boolean,
  custom_css text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name text;
BEGIN
  FOR _schema_name IN 
    SELECT schema_name FROM public.organizations
  LOOP
    RETURN QUERY EXECUTE format('
      SELECT j.id, j.title, j.department, j.location, j.employment_type,
             j.description, j.requirements, j.status, j.created_at,
             o.name as organization_name, o.id as organization_id, 
             o.schema_name as organization_schema,
             o.brand_name, o.logo_url, o.primary_color, o.secondary_color,
             o.company_description, o.careers_tagline, o.careers_banner_url,
             o.social_links, o.show_team_size, o.show_location, o.custom_css
      FROM %I.jobs j
      JOIN public.organizations o ON o.schema_name = %L
      WHERE j.id = $1 AND j.status = ''open''
    ', _schema_name, _schema_name) USING _job_id;
    
    IF FOUND THEN
      RETURN;
    END IF;
  END LOOP;
END;
$$;