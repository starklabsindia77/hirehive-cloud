-- Function to update candidate stage
CREATE OR REPLACE FUNCTION public.update_org_candidate_stage(
  _user_id UUID,
  _candidate_id UUID,
  _new_stage TEXT
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
    SET stage = $1, updated_at = now()
    WHERE id = $2
  ', _schema_name) USING _new_stage, _candidate_id;
END;
$$;