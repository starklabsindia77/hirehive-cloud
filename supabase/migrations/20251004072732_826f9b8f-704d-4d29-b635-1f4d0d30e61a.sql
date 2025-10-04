-- Create function to insert job in organization schema
CREATE OR REPLACE FUNCTION public.insert_organization_job(
  _title TEXT,
  _department TEXT,
  _location TEXT,
  _employment_type TEXT,
  _description TEXT,
  _requirements TEXT
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _user_id uuid;
  _org_schema text;
  _job_id uuid;
BEGIN
  -- Get current user
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user's organization schema
  SELECT o.schema_name INTO _org_schema
  FROM public.profiles p
  JOIN public.organizations o ON p.organization_id = o.id
  WHERE p.user_id = _user_id
  LIMIT 1;

  IF _org_schema IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  -- Generate new UUID for the job
  _job_id := gen_random_uuid();

  -- Insert job into organization schema
  EXECUTE format('
    INSERT INTO %I.jobs (
      id, title, department, location, employment_type,
      description, requirements, created_by, status, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())
  ', _org_schema)
  USING _job_id, _title, _department, _location, _employment_type, _description, _requirements, _user_id, 'open';

  RETURN _job_id;
END;
$$;