-- Create function to get public jobs from any organization schema
CREATE OR REPLACE FUNCTION public.get_public_jobs(_org_schema text DEFAULT NULL)
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
  organization_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _schema_name text;
BEGIN
  -- If specific org schema provided, use it
  IF _org_schema IS NOT NULL THEN
    RETURN QUERY EXECUTE format('
      SELECT j.id, j.title, j.department, j.location, j.employment_type,
             j.description, j.requirements, j.status, j.created_at,
             o.name as organization_name, o.id as organization_id
      FROM %I.jobs j
      JOIN public.organizations o ON o.schema_name = %L
      WHERE j.status = ''open''
      ORDER BY j.created_at DESC
    ', _org_schema, _org_schema);
  ELSE
    -- Return jobs from all organizations
    FOR _schema_name IN 
      SELECT schema_name FROM public.organizations
    LOOP
      RETURN QUERY EXECUTE format('
        SELECT j.id, j.title, j.department, j.location, j.employment_type,
               j.description, j.requirements, j.status, j.created_at,
               o.name as organization_name, o.id as organization_id
        FROM %I.jobs j
        JOIN public.organizations o ON o.schema_name = %L
        WHERE j.status = ''open''
        ORDER BY j.created_at DESC
      ', _schema_name, _schema_name);
    END LOOP;
  END IF;
END;
$$;

-- Create function to get a single public job
CREATE OR REPLACE FUNCTION public.get_public_job(_job_id uuid)
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
  organization_schema text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _schema_name text;
BEGIN
  -- Loop through all organization schemas to find the job
  FOR _schema_name IN 
    SELECT schema_name FROM public.organizations
  LOOP
    RETURN QUERY EXECUTE format('
      SELECT j.id, j.title, j.department, j.location, j.employment_type,
             j.description, j.requirements, j.status, j.created_at,
             o.name as organization_name, o.id as organization_id, 
             o.schema_name as organization_schema
      FROM %I.jobs j
      JOIN public.organizations o ON o.schema_name = %L
      WHERE j.id = $1 AND j.status = ''open''
    ', _schema_name, _schema_name) USING _job_id;
    
    -- If we found the job, exit
    IF FOUND THEN
      RETURN;
    END IF;
  END LOOP;
END;
$$;

-- Create function to submit public application
CREATE OR REPLACE FUNCTION public.submit_public_application(
  _org_schema text,
  _job_id uuid,
  _full_name text,
  _email text,
  _phone text,
  _linkedin_url text DEFAULT NULL,
  _resume_url text DEFAULT NULL,
  _cover_letter text DEFAULT NULL,
  _current_company text DEFAULT NULL,
  _current_position text DEFAULT NULL,
  _experience_years integer DEFAULT NULL,
  _skills text[] DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _candidate_id uuid;
  _application_id uuid;
  _existing_candidate_id uuid;
BEGIN
  -- Check if candidate already exists in this org by email
  EXECUTE format('
    SELECT id FROM %I.candidates WHERE email = $1 LIMIT 1
  ', _org_schema) INTO _existing_candidate_id USING _email;

  IF _existing_candidate_id IS NOT NULL THEN
    -- Use existing candidate
    _candidate_id := _existing_candidate_id;
    
    -- Update candidate info if new data provided
    EXECUTE format('
      UPDATE %I.candidates
      SET 
        full_name = COALESCE($2, full_name),
        phone = COALESCE($3, phone),
        linkedin_url = COALESCE($4, linkedin_url),
        resume_url = COALESCE($5, resume_url),
        current_company = COALESCE($6, current_company),
        current_position = COALESCE($7, current_position),
        experience_years = COALESCE($8, experience_years),
        skills = COALESCE($9, skills),
        updated_at = now()
      WHERE id = $1
    ', _org_schema) USING _candidate_id, _full_name, _phone, _linkedin_url, 
      _resume_url, _current_company, _current_position, _experience_years, _skills;
  ELSE
    -- Create new candidate
    _candidate_id := gen_random_uuid();
    
    EXECUTE format('
      INSERT INTO %I.candidates (
        id, full_name, email, phone, linkedin_url, resume_url,
        current_company, current_position, experience_years, skills,
        status, stage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ', _org_schema) USING _candidate_id, _full_name, _email, _phone, _linkedin_url,
      _resume_url, _current_company, _current_position, _experience_years, _skills,
      'new', 'applied';
  END IF;

  -- Create application
  _application_id := gen_random_uuid();
  
  EXECUTE format('
    INSERT INTO %I.applications (
      id, job_id, candidate_id, status, stage, notes
    ) VALUES ($1, $2, $3, $4, $5, $6)
  ', _org_schema) USING _application_id, _job_id, _candidate_id, 
    'applied', 'screening', _cover_letter;

  RETURN _application_id;
END;
$$;