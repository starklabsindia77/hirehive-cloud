-- Phase 2: Create interviews table in organization schemas
-- Phase 3: Create notes and activities tables in organization schemas

-- Function to add interviews table to an organization schema
CREATE OR REPLACE FUNCTION public.add_interviews_to_org_schema(_schema_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.interviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id UUID NOT NULL REFERENCES %I.applications(id) ON DELETE CASCADE,
      scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
      duration_minutes INTEGER DEFAULT 60,
      interview_type TEXT NOT NULL,
      location TEXT,
      meeting_link TEXT,
      interviewer_notes TEXT,
      status TEXT DEFAULT ''scheduled'',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name, _schema_name);

  -- Add trigger for updated_at
  EXECUTE format('
    DROP TRIGGER IF EXISTS update_interviews_updated_at ON %I.interviews
  ', _schema_name);
  
  EXECUTE format('
    CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON %I.interviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()
  ', _schema_name);
END;
$$;

-- Function to add notes table to an organization schema
CREATE OR REPLACE FUNCTION public.add_notes_to_org_schema(_schema_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      candidate_id UUID NOT NULL REFERENCES %I.candidates(id) ON DELETE CASCADE,
      author_id UUID NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name, _schema_name);

  -- Add trigger for updated_at
  EXECUTE format('
    DROP TRIGGER IF EXISTS update_notes_updated_at ON %I.notes
  ', _schema_name);
  
  EXECUTE format('
    CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON %I.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()
  ', _schema_name);
END;
$$;

-- Function to add activities table to an organization schema
CREATE OR REPLACE FUNCTION public.add_activities_to_org_schema(_schema_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      candidate_id UUID REFERENCES %I.candidates(id) ON DELETE CASCADE,
      job_id UUID REFERENCES %I.jobs(id) ON DELETE CASCADE,
      user_id UUID NOT NULL,
      activity_type TEXT NOT NULL,
      description TEXT NOT NULL,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name, _schema_name, _schema_name);

  -- Add index for faster queries
  EXECUTE format('
    CREATE INDEX IF NOT EXISTS idx_activities_candidate ON %I.activities(candidate_id)
  ', _schema_name);
  
  EXECUTE format('
    CREATE INDEX IF NOT EXISTS idx_activities_job ON %I.activities(job_id)
  ', _schema_name);
END;
$$;

-- Update create_organization_schema to include new tables
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
  
  -- Grant usage on schema to authenticated users
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO authenticated', _schema_name);
  EXECUTE format('GRANT ALL ON ALL TABLES IN SCHEMA %I TO authenticated', _schema_name);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON TABLES TO authenticated', _schema_name);
END;
$$;

-- RPC functions for interviews
CREATE OR REPLACE FUNCTION public.get_org_interviews(_user_id uuid, _application_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  application_id uuid,
  scheduled_at timestamptz,
  duration_minutes int,
  interview_type text,
  location text,
  meeting_link text,
  interviewer_notes text,
  status text,
  created_at timestamptz,
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
    SELECT id, application_id, scheduled_at, duration_minutes, interview_type,
           location, meeting_link, interviewer_notes, status, created_at, updated_at
    FROM %I.interviews
    WHERE 1=1
  ', _schema_name);

  IF _application_id IS NOT NULL THEN
    _sql := _sql || format(' AND application_id = %L', _application_id);
  END IF;

  _sql := _sql || ' ORDER BY scheduled_at DESC';

  RETURN QUERY EXECUTE _sql;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_org_interview(
  _user_id uuid,
  _application_id uuid,
  _scheduled_at timestamptz,
  _duration_minutes int,
  _interview_type text,
  _location text DEFAULT NULL,
  _meeting_link text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _schema_name text;
  _interview_id uuid;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  _interview_id := gen_random_uuid();

  EXECUTE format('
    INSERT INTO %I.interviews (id, application_id, scheduled_at, duration_minutes, interview_type, location, meeting_link, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  ', _schema_name) USING _interview_id, _application_id, _scheduled_at, _duration_minutes, _interview_type, _location, _meeting_link, 'scheduled';

  RETURN _interview_id;
END;
$$;

-- RPC functions for notes
CREATE OR REPLACE FUNCTION public.get_org_notes(_user_id uuid, _candidate_id uuid)
RETURNS TABLE (
  id uuid,
  candidate_id uuid,
  author_id uuid,
  content text,
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
    SELECT id, candidate_id, author_id, content, created_at, updated_at
    FROM %I.notes
    WHERE candidate_id = $1
    ORDER BY created_at DESC
  ', _schema_name) USING _candidate_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_org_note(
  _user_id uuid,
  _candidate_id uuid,
  _content text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _schema_name text;
  _note_id uuid;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  _note_id := gen_random_uuid();

  EXECUTE format('
    INSERT INTO %I.notes (id, candidate_id, author_id, content)
    VALUES ($1, $2, $3, $4)
  ', _schema_name) USING _note_id, _candidate_id, _user_id, _content;

  RETURN _note_id;
END;
$$;

-- RPC functions for activities
CREATE OR REPLACE FUNCTION public.get_org_activities(_user_id uuid, _candidate_id uuid DEFAULT NULL, _job_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  candidate_id uuid,
  job_id uuid,
  user_id uuid,
  activity_type text,
  description text,
  metadata jsonb,
  created_at timestamptz
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
    SELECT id, candidate_id, job_id, user_id, activity_type, description, metadata, created_at
    FROM %I.activities
    WHERE 1=1
  ', _schema_name);

  IF _candidate_id IS NOT NULL THEN
    _sql := _sql || format(' AND candidate_id = %L', _candidate_id);
  END IF;

  IF _job_id IS NOT NULL THEN
    _sql := _sql || format(' AND job_id = %L', _job_id);
  END IF;

  _sql := _sql || ' ORDER BY created_at DESC LIMIT 50';

  RETURN QUERY EXECUTE _sql;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_org_activity(
  _user_id uuid,
  _activity_type text,
  _description text,
  _candidate_id uuid DEFAULT NULL,
  _job_id uuid DEFAULT NULL,
  _metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _schema_name text;
  _activity_id uuid;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  _activity_id := gen_random_uuid();

  EXECUTE format('
    INSERT INTO %I.activities (id, candidate_id, job_id, user_id, activity_type, description, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  ', _schema_name) USING _activity_id, _candidate_id, _job_id, _user_id, _activity_type, _description, _metadata;

  RETURN _activity_id;
END;
$$;

-- Function to update application stage
CREATE OR REPLACE FUNCTION public.update_org_application_stage(
  _user_id uuid,
  _application_id uuid,
  _new_stage text
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
    UPDATE %I.applications
    SET stage = $1, updated_at = now()
    WHERE id = $2
  ', _schema_name) USING _new_stage, _application_id;
  
  -- Also update candidate stage
  EXECUTE format('
    UPDATE %I.candidates
    SET stage = $1, updated_at = now()
    WHERE id = (SELECT candidate_id FROM %I.applications WHERE id = $2)
  ', _schema_name, _schema_name) USING _new_stage, _application_id;
END;
$$;