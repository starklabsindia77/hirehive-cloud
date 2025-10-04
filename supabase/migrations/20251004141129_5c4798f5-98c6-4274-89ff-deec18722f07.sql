-- Add update and delete functions for interviews
CREATE OR REPLACE FUNCTION public.update_org_interview(
  _user_id uuid,
  _interview_id uuid,
  _scheduled_at timestamp with time zone,
  _duration_minutes integer,
  _interview_type text,
  _location text DEFAULT NULL,
  _meeting_link text DEFAULT NULL,
  _status text DEFAULT 'scheduled',
  _interviewer_notes text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _schema_name text;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  EXECUTE format('
    UPDATE %I.interviews
    SET scheduled_at = $1, 
        duration_minutes = $2, 
        interview_type = $3, 
        location = $4, 
        meeting_link = $5,
        status = $6,
        interviewer_notes = $7,
        updated_at = now()
    WHERE id = $8
  ', _schema_name) USING _scheduled_at, _duration_minutes, _interview_type, _location, _meeting_link, _status, _interviewer_notes, _interview_id;
END;
$function$;

-- Add delete function for interviews
CREATE OR REPLACE FUNCTION public.delete_org_interview(
  _user_id uuid,
  _interview_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _schema_name text;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  EXECUTE format('DELETE FROM %I.interviews WHERE id = $1', _schema_name) USING _interview_id;
END;
$function$;

-- Create saved searches table function
CREATE OR REPLACE FUNCTION public.add_saved_searches_to_org_schema(_schema_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.saved_searches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      name TEXT NOT NULL,
      filters JSONB NOT NULL,
      search_type TEXT NOT NULL DEFAULT ''candidate'',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name);

  EXECUTE format('
    CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON %I.saved_searches(user_id)
  ', _schema_name);

  EXECUTE format('
    DROP TRIGGER IF EXISTS update_saved_searches_updated_at ON %I.saved_searches
  ', _schema_name);
  
  EXECUTE format('
    CREATE TRIGGER update_saved_searches_updated_at
    BEFORE UPDATE ON %I.saved_searches
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()
  ', _schema_name);
END;
$function$;

-- Add saved searches to existing organizations
DO $$
DECLARE
  org_schema text;
BEGIN
  FOR org_schema IN SELECT schema_name FROM public.organizations
  LOOP
    PERFORM public.add_saved_searches_to_org_schema(org_schema);
  END LOOP;
END $$;

-- Functions for saved searches
CREATE OR REPLACE FUNCTION public.create_saved_search(
  _user_id uuid,
  _name text,
  _filters jsonb,
  _search_type text DEFAULT 'candidate'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _schema_name text;
  _search_id uuid;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  _search_id := gen_random_uuid();

  EXECUTE format('
    INSERT INTO %I.saved_searches (id, user_id, name, filters, search_type)
    VALUES ($1, $2, $3, $4, $5)
  ', _schema_name) USING _search_id, _user_id, _name, _filters, _search_type;

  RETURN _search_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_saved_searches(
  _user_id uuid,
  _search_type text DEFAULT 'candidate'
) RETURNS TABLE(id uuid, user_id uuid, name text, filters jsonb, search_type text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _schema_name text;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY EXECUTE format('
    SELECT id, user_id, name, filters, search_type, created_at, updated_at
    FROM %I.saved_searches
    WHERE user_id = $1 AND search_type = $2
    ORDER BY created_at DESC
  ', _schema_name) USING _user_id, _search_type;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_saved_search(
  _user_id uuid,
  _search_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _schema_name text;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  EXECUTE format('DELETE FROM %I.saved_searches WHERE id = $1 AND user_id = $2', _schema_name) 
  USING _search_id, _user_id;
END;
$function$;