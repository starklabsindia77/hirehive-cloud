-- Create RPC functions to query organization-specific tables

-- Function to get jobs for user's organization
CREATE OR REPLACE FUNCTION public.get_org_jobs(_user_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  department text,
  location text,
  employment_type text,
  description text,
  requirements text,
  status text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
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
    SELECT id, title, department, location, employment_type, description, 
           requirements, status, created_by, created_at, updated_at
    FROM %I.jobs
    ORDER BY created_at DESC
  ', _schema_name);
END;
$$;

-- Function to get a single job
CREATE OR REPLACE FUNCTION public.get_org_job(_user_id uuid, _job_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  department text,
  location text,
  employment_type text,
  description text,
  requirements text,
  status text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
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
    SELECT id, title, department, location, employment_type, description, 
           requirements, status, created_by, created_at, updated_at
    FROM %I.jobs
    WHERE id = $1
  ', _schema_name) USING _job_id;
END;
$$;

-- Function to get candidates for user's organization
CREATE OR REPLACE FUNCTION public.get_org_candidates(_user_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  phone text,
  linkedin_url text,
  resume_url text,
  current_company text,
  current_position text,
  experience_years int,
  skills text[],
  status text,
  stage text,
  created_at timestamptz,
  updated_at timestamptz
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
    SELECT id, full_name, email, phone, linkedin_url, resume_url,
           current_company, current_position, experience_years, skills,
           status, stage, created_at, updated_at
    FROM %I.candidates
    ORDER BY created_at DESC
  ', _schema_name);
END;
$$;

-- Function to get a single candidate
CREATE OR REPLACE FUNCTION public.get_org_candidate(_user_id uuid, _candidate_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  phone text,
  linkedin_url text,
  resume_url text,
  current_company text,
  current_position text,
  experience_years int,
  skills text[],
  status text,
  stage text,
  created_at timestamptz,
  updated_at timestamptz
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
    SELECT id, full_name, email, phone, linkedin_url, resume_url,
           current_company, current_position, experience_years, skills,
           status, stage, created_at, updated_at
    FROM %I.candidates
    WHERE id = $1
  ', _schema_name) USING _candidate_id;
END;
$$;

-- Function to get applications
CREATE OR REPLACE FUNCTION public.get_org_applications(_user_id uuid, _job_id uuid DEFAULT NULL, _candidate_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  job_id uuid,
  candidate_id uuid,
  status text,
  stage text,
  notes text,
  applied_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _schema_name text;
  _sql text;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RETURN;
  END IF;

  _sql := format('
    SELECT id, job_id, candidate_id, status, stage, notes, applied_at, updated_at
    FROM %I.applications
    WHERE 1=1
  ', _schema_name);

  IF _job_id IS NOT NULL THEN
    _sql := _sql || format(' AND job_id = %L', _job_id);
  END IF;

  IF _candidate_id IS NOT NULL THEN
    _sql := _sql || format(' AND candidate_id = %L', _candidate_id);
  END IF;

  _sql := _sql || ' ORDER BY applied_at DESC';

  RETURN QUERY EXECUTE _sql;
END;
$$;

-- Function to delete a job
CREATE OR REPLACE FUNCTION public.delete_org_job(_user_id uuid, _job_id uuid)
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

  EXECUTE format('DELETE FROM %I.jobs WHERE id = $1', _schema_name) USING _job_id;
END;
$$;