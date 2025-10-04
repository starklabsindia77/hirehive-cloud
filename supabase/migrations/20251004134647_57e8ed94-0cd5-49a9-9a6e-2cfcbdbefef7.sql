-- Drop and recreate get_org_candidates with assigned_to
DROP FUNCTION IF EXISTS public.get_org_candidates(uuid);

CREATE FUNCTION public.get_org_candidates(_user_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  email text,
  phone text,
  linkedin_url text,
  resume_url text,
  current_company text,
  current_position text,
  experience_years integer,
  skills text[],
  status text,
  stage text,
  assigned_to uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
           status, stage, assigned_to, created_at, updated_at
    FROM %I.candidates
    ORDER BY created_at DESC
  ', _schema_name);
END;
$$;

-- Drop and recreate get_org_candidate with assigned_to
DROP FUNCTION IF EXISTS public.get_org_candidate(uuid, uuid);

CREATE FUNCTION public.get_org_candidate(_user_id uuid, _candidate_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  email text,
  phone text,
  linkedin_url text,
  resume_url text,
  current_company text,
  current_position text,
  experience_years integer,
  skills text[],
  status text,
  stage text,
  assigned_to uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
           status, stage, assigned_to, created_at, updated_at
    FROM %I.candidates
    WHERE id = $1
  ', _schema_name) USING _candidate_id;
END;
$$;