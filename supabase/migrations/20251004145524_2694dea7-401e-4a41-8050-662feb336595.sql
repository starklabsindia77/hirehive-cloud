-- Add onboarding tables to organization schemas
CREATE OR REPLACE FUNCTION public.add_onboarding_to_org_schema(_schema_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Onboarding templates table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.onboarding_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      duration_days INTEGER DEFAULT 30,
      is_active BOOLEAN DEFAULT true,
      created_by UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name);

  -- Onboarding processes table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.onboarding_processes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      candidate_id UUID NOT NULL REFERENCES %I.candidates(id) ON DELETE CASCADE,
      template_id UUID REFERENCES %I.onboarding_templates(id),
      start_date DATE NOT NULL,
      expected_end_date DATE,
      actual_end_date DATE,
      status TEXT DEFAULT ''in_progress'' CHECK (status IN (''not_started'', ''in_progress'', ''completed'', ''on_hold'')),
      progress_percentage INTEGER DEFAULT 0,
      assigned_buddy_id UUID,
      assigned_manager_id UUID,
      notes TEXT,
      created_by UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name, _schema_name, _schema_name);

  -- Onboarding tasks table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.onboarding_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      onboarding_id UUID NOT NULL REFERENCES %I.onboarding_processes(id) ON DELETE CASCADE,
      template_id UUID REFERENCES %I.onboarding_templates(id),
      title TEXT NOT NULL,
      description TEXT,
      task_type TEXT DEFAULT ''general'' CHECK (task_type IN (''document'', ''training'', ''meeting'', ''equipment'', ''access'', ''general'')),
      assigned_to UUID,
      due_date DATE,
      completed_at TIMESTAMP WITH TIME ZONE,
      status TEXT DEFAULT ''pending'' CHECK (status IN (''pending'', ''in_progress'', ''completed'', ''skipped'')),
      order_index INTEGER DEFAULT 0,
      is_required BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name, _schema_name, _schema_name);

  -- Onboarding documents table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.onboarding_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      onboarding_id UUID NOT NULL REFERENCES %I.onboarding_processes(id) ON DELETE CASCADE,
      document_name TEXT NOT NULL,
      document_type TEXT NOT NULL,
      file_url TEXT,
      is_required BOOLEAN DEFAULT true,
      status TEXT DEFAULT ''pending'' CHECK (status IN (''pending'', ''submitted'', ''approved'', ''rejected'')),
      submitted_at TIMESTAMP WITH TIME ZONE,
      reviewed_by UUID,
      reviewed_at TIMESTAMP WITH TIME ZONE,
      review_notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name, _schema_name);

  -- Add indexes
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_onboarding_processes_candidate ON %I.onboarding_processes(candidate_id)', _schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_onboarding ON %I.onboarding_tasks(onboarding_id)', _schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_onboarding_documents_onboarding ON %I.onboarding_documents(onboarding_id)', _schema_name);

  -- Add triggers for updated_at
  EXECUTE format('
    DROP TRIGGER IF EXISTS update_onboarding_templates_updated_at ON %I.onboarding_templates
  ', _schema_name);
  
  EXECUTE format('
    CREATE TRIGGER update_onboarding_templates_updated_at
    BEFORE UPDATE ON %I.onboarding_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()
  ', _schema_name);

  EXECUTE format('
    DROP TRIGGER IF EXISTS update_onboarding_processes_updated_at ON %I.onboarding_processes
  ', _schema_name);
  
  EXECUTE format('
    CREATE TRIGGER update_onboarding_processes_updated_at
    BEFORE UPDATE ON %I.onboarding_processes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()
  ', _schema_name);

  EXECUTE format('
    DROP TRIGGER IF EXISTS update_onboarding_tasks_updated_at ON %I.onboarding_tasks
  ', _schema_name);
  
  EXECUTE format('
    CREATE TRIGGER update_onboarding_tasks_updated_at
    BEFORE UPDATE ON %I.onboarding_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()
  ', _schema_name);

  EXECUTE format('
    DROP TRIGGER IF EXISTS update_onboarding_documents_updated_at ON %I.onboarding_documents
  ', _schema_name);
  
  EXECUTE format('
    CREATE TRIGGER update_onboarding_documents_updated_at
    BEFORE UPDATE ON %I.onboarding_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()
  ', _schema_name);
END;
$$;

-- Create functions for onboarding management
CREATE OR REPLACE FUNCTION public.create_onboarding_process(
  _user_id UUID,
  _candidate_id UUID,
  _template_id UUID,
  _start_date DATE,
  _assigned_buddy_id UUID DEFAULT NULL,
  _assigned_manager_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name TEXT;
  _onboarding_id UUID;
  _duration_days INTEGER;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  _onboarding_id := gen_random_uuid();

  -- Get template duration
  EXECUTE format('SELECT duration_days FROM %I.onboarding_templates WHERE id = $1', _schema_name)
  INTO _duration_days USING _template_id;

  -- Create onboarding process
  EXECUTE format('
    INSERT INTO %I.onboarding_processes (
      id, candidate_id, template_id, start_date, expected_end_date,
      assigned_buddy_id, assigned_manager_id, created_by, status
    ) VALUES ($1, $2, $3, $4, $4 + $5, $6, $7, $8, $9)
  ', _schema_name) USING _onboarding_id, _candidate_id, _template_id, _start_date, 
    COALESCE(_duration_days, 30), _assigned_buddy_id, _assigned_manager_id, _user_id, 'not_started';

  RETURN _onboarding_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_onboarding_processes(_user_id UUID, _candidate_id UUID DEFAULT NULL)
RETURNS TABLE(
  id UUID, candidate_id UUID, template_id UUID, start_date DATE,
  expected_end_date DATE, actual_end_date DATE, status TEXT,
  progress_percentage INTEGER, assigned_buddy_id UUID, assigned_manager_id UUID,
  notes TEXT, created_by UUID, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name TEXT;
  _sql TEXT;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RETURN;
  END IF;

  _sql := format('
    SELECT id, candidate_id, template_id, start_date, expected_end_date,
           actual_end_date, status, progress_percentage, assigned_buddy_id,
           assigned_manager_id, notes, created_by, created_at, updated_at
    FROM %I.onboarding_processes
    WHERE 1=1
  ', _schema_name);

  IF _candidate_id IS NOT NULL THEN
    _sql := _sql || format(' AND candidate_id = %L', _candidate_id);
  END IF;

  _sql := _sql || ' ORDER BY created_at DESC';

  RETURN QUERY EXECUTE _sql;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_task_status(
  _user_id UUID,
  _task_id UUID,
  _new_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name TEXT;
  _onboarding_id UUID;
  _total_tasks INTEGER;
  _completed_tasks INTEGER;
  _progress INTEGER;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  -- Update task status
  EXECUTE format('
    UPDATE %I.onboarding_tasks
    SET status = $1,
        completed_at = CASE WHEN $1 = ''completed'' THEN now() ELSE NULL END
    WHERE id = $2
    RETURNING onboarding_id
  ', _schema_name) USING _new_status, _task_id INTO _onboarding_id;

  -- Calculate progress
  EXECUTE format('SELECT COUNT(*) FROM %I.onboarding_tasks WHERE onboarding_id = $1', _schema_name)
  INTO _total_tasks USING _onboarding_id;

  EXECUTE format('SELECT COUNT(*) FROM %I.onboarding_tasks WHERE onboarding_id = $1 AND status = ''completed''', _schema_name)
  INTO _completed_tasks USING _onboarding_id;

  _progress := CASE WHEN _total_tasks > 0 THEN (_completed_tasks * 100) / _total_tasks ELSE 0 END;

  -- Update onboarding progress
  EXECUTE format('
    UPDATE %I.onboarding_processes
    SET progress_percentage = $1,
        status = CASE WHEN $1 = 100 THEN ''completed'' ELSE status END,
        actual_end_date = CASE WHEN $1 = 100 THEN CURRENT_DATE ELSE actual_end_date END
    WHERE id = $2
  ', _schema_name) USING _progress, _onboarding_id;
END;
$$;

-- Apply to all existing organizations
DO $$
DECLARE
  org_record RECORD;
BEGIN
  FOR org_record IN SELECT schema_name FROM public.organizations LOOP
    PERFORM public.add_onboarding_to_org_schema(org_record.schema_name);
  END LOOP;
END $$;