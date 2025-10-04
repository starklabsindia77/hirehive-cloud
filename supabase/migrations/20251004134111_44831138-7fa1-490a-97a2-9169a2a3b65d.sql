-- Add ratings table to org schema function
CREATE OR REPLACE FUNCTION public.add_ratings_to_org_schema(_schema_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.candidate_ratings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      candidate_id UUID NOT NULL REFERENCES %I.candidates(id) ON DELETE CASCADE,
      reviewer_id UUID NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      category TEXT NOT NULL,
      feedback TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name, _schema_name);

  EXECUTE format('
    CREATE INDEX IF NOT EXISTS idx_ratings_candidate ON %I.candidate_ratings(candidate_id)
  ', _schema_name);

  EXECUTE format('
    DROP TRIGGER IF EXISTS update_candidate_ratings_updated_at ON %I.candidate_ratings
  ', _schema_name);
  
  EXECUTE format('
    CREATE TRIGGER update_candidate_ratings_updated_at
    BEFORE UPDATE ON %I.candidate_ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()
  ', _schema_name);
END;
$$;

-- Add comments table to org schema function
CREATE OR REPLACE FUNCTION public.add_comments_to_org_schema(_schema_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.candidate_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      candidate_id UUID NOT NULL REFERENCES %I.candidates(id) ON DELETE CASCADE,
      author_id UUID NOT NULL,
      content TEXT NOT NULL,
      is_internal BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name, _schema_name);

  EXECUTE format('
    CREATE INDEX IF NOT EXISTS idx_comments_candidate ON %I.candidate_comments(candidate_id)
  ', _schema_name);

  EXECUTE format('
    DROP TRIGGER IF EXISTS update_candidate_comments_updated_at ON %I.candidate_comments
  ', _schema_name);
  
  EXECUTE format('
    CREATE TRIGGER update_candidate_comments_updated_at
    BEFORE UPDATE ON %I.candidate_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()
  ', _schema_name);
END;
$$;

-- Add assignments to candidates table
CREATE OR REPLACE FUNCTION public.add_assignments_to_org_candidates(_schema_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  EXECUTE format('
    ALTER TABLE %I.candidates 
    ADD COLUMN IF NOT EXISTS assigned_to UUID
  ', _schema_name);
END;
$$;

-- Apply to existing schemas
DO $$
DECLARE
  org_record RECORD;
BEGIN
  FOR org_record IN SELECT schema_name FROM public.organizations LOOP
    PERFORM public.add_ratings_to_org_schema(org_record.schema_name);
    PERFORM public.add_comments_to_org_schema(org_record.schema_name);
    PERFORM public.add_assignments_to_org_candidates(org_record.schema_name);
  END LOOP;
END $$;

-- Update create_organization_schema to include new tables
CREATE OR REPLACE FUNCTION public.create_organization_schema(_org_id uuid, _schema_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', _schema_name);
  
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
      assigned_to UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )', _schema_name);
  
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

  PERFORM public.add_interviews_to_org_schema(_schema_name);
  PERFORM public.add_notes_to_org_schema(_schema_name);
  PERFORM public.add_activities_to_org_schema(_schema_name);
  PERFORM public.add_email_templates_to_org_schema(_schema_name);
  PERFORM public.add_ratings_to_org_schema(_schema_name);
  PERFORM public.add_comments_to_org_schema(_schema_name);
  
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO authenticated', _schema_name);
  EXECUTE format('GRANT ALL ON ALL TABLES IN SCHEMA %I TO authenticated', _schema_name);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON TABLES TO authenticated', _schema_name);
END;
$function$;

-- Functions to manage ratings
CREATE OR REPLACE FUNCTION public.create_candidate_rating(
  _user_id UUID,
  _candidate_id UUID,
  _rating INTEGER,
  _category TEXT,
  _feedback TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name TEXT;
  _rating_id UUID;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  _rating_id := gen_random_uuid();

  EXECUTE format('
    INSERT INTO %I.candidate_ratings (id, candidate_id, reviewer_id, rating, category, feedback)
    VALUES ($1, $2, $3, $4, $5, $6)
  ', _schema_name) USING _rating_id, _candidate_id, _user_id, _rating, _category, _feedback;

  RETURN _rating_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_candidate_ratings(
  _user_id UUID,
  _candidate_id UUID
) RETURNS TABLE(
  id UUID,
  candidate_id UUID,
  reviewer_id UUID,
  rating INTEGER,
  category TEXT,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name TEXT;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY EXECUTE format('
    SELECT id, candidate_id, reviewer_id, rating, category, feedback, created_at, updated_at
    FROM %I.candidate_ratings
    WHERE candidate_id = $1
    ORDER BY created_at DESC
  ', _schema_name) USING _candidate_id;
END;
$$;

-- Functions to manage comments
CREATE OR REPLACE FUNCTION public.create_candidate_comment(
  _user_id UUID,
  _candidate_id UUID,
  _content TEXT,
  _is_internal BOOLEAN DEFAULT true
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name TEXT;
  _comment_id UUID;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  _comment_id := gen_random_uuid();

  EXECUTE format('
    INSERT INTO %I.candidate_comments (id, candidate_id, author_id, content, is_internal)
    VALUES ($1, $2, $3, $4, $5)
  ', _schema_name) USING _comment_id, _candidate_id, _user_id, _content, _is_internal;

  RETURN _comment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_candidate_comments(
  _user_id UUID,
  _candidate_id UUID
) RETURNS TABLE(
  id UUID,
  candidate_id UUID,
  author_id UUID,
  content TEXT,
  is_internal BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name TEXT;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY EXECUTE format('
    SELECT id, candidate_id, author_id, content, is_internal, created_at, updated_at
    FROM %I.candidate_comments
    WHERE candidate_id = $1
    ORDER BY created_at DESC
  ', _schema_name) USING _candidate_id;
END;
$$;

-- Function to assign candidate
CREATE OR REPLACE FUNCTION public.assign_candidate(
  _user_id UUID,
  _candidate_id UUID,
  _assigned_to UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name TEXT;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  EXECUTE format('
    UPDATE %I.candidates
    SET assigned_to = $1, updated_at = now()
    WHERE id = $2
  ', _schema_name) USING _assigned_to, _candidate_id;
END;
$$;