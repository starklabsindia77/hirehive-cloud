-- Create function to add email_templates table to organization schemas
CREATE OR REPLACE FUNCTION public.add_email_templates_to_org_schema(_schema_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.email_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      template_type TEXT NOT NULL,
      variables TEXT[],
      created_by UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name);

  -- Add trigger for updated_at
  EXECUTE format('
    DROP TRIGGER IF EXISTS update_email_templates_updated_at ON %I.email_templates
  ', _schema_name);
  
  EXECUTE format('
    CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON %I.email_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()
  ', _schema_name);
END;
$$;

-- Add email_templates to all existing organization schemas
DO $$
DECLARE
  _schema_name text;
BEGIN
  FOR _schema_name IN 
    SELECT schema_name FROM public.organizations
  LOOP
    PERFORM public.add_email_templates_to_org_schema(_schema_name);
  END LOOP;
END $$;

-- Update create_organization_schema to include email_templates
CREATE OR REPLACE FUNCTION public.create_organization_schema(_org_id uuid, _schema_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create the schema
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', _schema_name);
  
  -- Create jobs table in org schema
  EXECUTE format('
    CREATE TABLE %I.jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      department TEXT,
      location TEXT,
      employment_type TEXT,
      description TEXT,
      requirements TEXT,
      status TEXT DEFAULT ''open'',
      created_by UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )', _schema_name);
  
  -- Create candidates table in org schema
  EXECUTE format('
    CREATE TABLE %I.candidates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      linkedin_url TEXT,
      resume_url TEXT,
      current_company TEXT,
      current_position TEXT,
      experience_years INTEGER,
      skills TEXT[],
      status TEXT DEFAULT ''new'',
      stage TEXT DEFAULT ''applied'',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )', _schema_name);
  
  -- Create applications table in org schema
  EXECUTE format('
    CREATE TABLE %I.applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_id UUID NOT NULL REFERENCES %I.jobs(id) ON DELETE CASCADE,
      candidate_id UUID NOT NULL REFERENCES %I.candidates(id) ON DELETE CASCADE,
      status TEXT DEFAULT ''applied'',
      stage TEXT DEFAULT ''screening'',
      notes TEXT,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )', _schema_name, _schema_name, _schema_name);

  -- Add new tables
  PERFORM public.add_interviews_to_org_schema(_schema_name);
  PERFORM public.add_notes_to_org_schema(_schema_name);
  PERFORM public.add_activities_to_org_schema(_schema_name);
  PERFORM public.add_email_templates_to_org_schema(_schema_name);
  
  -- Grant usage on schema to authenticated users
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO authenticated', _schema_name);
  EXECUTE format('GRANT ALL ON ALL TABLES IN SCHEMA %I TO authenticated', _schema_name);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON TABLES TO authenticated', _schema_name);
END;
$$;

-- Create functions to manage email templates
CREATE OR REPLACE FUNCTION public.get_org_email_templates(_user_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  subject text,
  content text,
  template_type text,
  variables text[],
  created_by uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _schema_name text;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY EXECUTE format('
    SELECT id, name, subject, content, template_type, variables, 
           created_by, created_at, updated_at
    FROM %I.email_templates
    ORDER BY created_at DESC
  ', _schema_name);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_email_template(
  _user_id uuid,
  _name text,
  _subject text,
  _content text,
  _template_type text,
  _variables text[] DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _schema_name text;
  _template_id uuid;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  _template_id := gen_random_uuid();

  EXECUTE format('
    INSERT INTO %I.email_templates (id, name, subject, content, template_type, variables, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  ', _schema_name) USING _template_id, _name, _subject, _content, _template_type, _variables, _user_id;

  RETURN _template_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_email_template(
  _user_id uuid,
  _template_id uuid,
  _name text,
  _subject text,
  _content text,
  _template_type text,
  _variables text[] DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _schema_name text;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  EXECUTE format('
    UPDATE %I.email_templates
    SET name = $1, subject = $2, content = $3, template_type = $4, 
        variables = $5, updated_at = now()
    WHERE id = $6
  ', _schema_name) USING _name, _subject, _content, _template_type, _variables, _template_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_email_template(_user_id uuid, _template_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _schema_name text;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  EXECUTE format('DELETE FROM %I.email_templates WHERE id = $1', _schema_name) 
  USING _template_id;
END;
$$;