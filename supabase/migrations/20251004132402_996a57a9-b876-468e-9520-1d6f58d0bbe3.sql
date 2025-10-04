-- Function to create a candidate manually
CREATE OR REPLACE FUNCTION public.create_org_candidate(
  _user_id UUID,
  _full_name TEXT,
  _email TEXT,
  _phone TEXT DEFAULT NULL,
  _linkedin_url TEXT DEFAULT NULL,
  _resume_url TEXT DEFAULT NULL,
  _current_company TEXT DEFAULT NULL,
  _current_position TEXT DEFAULT NULL,
  _experience_years INTEGER DEFAULT NULL,
  _skills TEXT[] DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name TEXT;
  _candidate_id UUID;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  _candidate_id := gen_random_uuid();

  EXECUTE format('
    INSERT INTO %I.candidates (
      id, full_name, email, phone, linkedin_url, resume_url,
      current_company, current_position, experience_years, skills, status, stage
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  ', _schema_name) USING _candidate_id, _full_name, _email, _phone, _linkedin_url,
    _resume_url, _current_company, _current_position, _experience_years, _skills, 'new', 'screening';

  RETURN _candidate_id;
END;
$$;

-- Function to create an application linking candidate to job
CREATE OR REPLACE FUNCTION public.create_org_application(
  _user_id UUID,
  _job_id UUID,
  _candidate_id UUID,
  _notes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name TEXT;
  _application_id UUID;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  _application_id := gen_random_uuid();

  EXECUTE format('
    INSERT INTO %I.applications (id, job_id, candidate_id, status, stage, notes)
    VALUES ($1, $2, $3, $4, $5, $6)
  ', _schema_name) USING _application_id, _job_id, _candidate_id, 'applied', 'screening', _notes;

  RETURN _application_id;
END;
$$;