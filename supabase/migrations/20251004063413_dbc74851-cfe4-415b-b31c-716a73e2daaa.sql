-- Fix search path security warning for create_organization_schema function
CREATE OR REPLACE FUNCTION public.create_organization_schema(_org_id UUID, _schema_name TEXT)
RETURNS VOID
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
  
  -- Grant usage on schema to authenticated users
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO authenticated', _schema_name);
  EXECUTE format('GRANT ALL ON ALL TABLES IN SCHEMA %I TO authenticated', _schema_name);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON TABLES TO authenticated', _schema_name);
END;
$$;