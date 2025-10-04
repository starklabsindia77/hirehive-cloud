-- Add functions to get onboarding tasks and documents
CREATE OR REPLACE FUNCTION public.get_onboarding_tasks(_user_id UUID, _onboarding_id UUID)
RETURNS TABLE(
  id UUID, onboarding_id UUID, template_id UUID, title TEXT, description TEXT,
  task_type TEXT, assigned_to UUID, due_date DATE, completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT, order_index INTEGER, is_required BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE
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
    SELECT id, onboarding_id, template_id, title, description, task_type,
           assigned_to, due_date, completed_at, status, order_index, is_required,
           created_at, updated_at
    FROM %I.onboarding_tasks
    WHERE onboarding_id = $1
    ORDER BY order_index
  ', _schema_name) USING _onboarding_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_onboarding_documents(_user_id UUID, _onboarding_id UUID)
RETURNS TABLE(
  id UUID, onboarding_id UUID, document_name TEXT, document_type TEXT,
  file_url TEXT, is_required BOOLEAN, status TEXT, submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID, reviewed_at TIMESTAMP WITH TIME ZONE, review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE
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
    SELECT id, onboarding_id, document_name, document_type, file_url,
           is_required, status, submitted_at, reviewed_by, reviewed_at,
           review_notes, created_at, updated_at
    FROM %I.onboarding_documents
    WHERE onboarding_id = $1
    ORDER BY created_at
  ', _schema_name) USING _onboarding_id;
END;
$$;