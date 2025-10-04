-- Create workflow automation tables
CREATE TYPE workflow_trigger_type AS ENUM (
  'candidate_created',
  'application_submitted',
  'stage_changed',
  'time_based',
  'candidate_inactive',
  'score_threshold',
  'webhook_received'
);

CREATE TYPE workflow_action_type AS ENUM (
  'send_email',
  'update_stage',
  'assign_to_user',
  'add_tag',
  'webhook_call',
  'create_task',
  'send_notification'
);

CREATE TYPE workflow_status AS ENUM ('active', 'inactive', 'draft');

-- Add workflow tables to organization schemas
CREATE OR REPLACE FUNCTION public.add_workflows_to_org_schema(_schema_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Workflows table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.workflows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      status workflow_status DEFAULT ''draft'',
      trigger_type workflow_trigger_type NOT NULL,
      trigger_config JSONB DEFAULT ''{}''::jsonb,
      created_by UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name);

  -- Workflow actions table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.workflow_actions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workflow_id UUID NOT NULL REFERENCES %I.workflows(id) ON DELETE CASCADE,
      action_type workflow_action_type NOT NULL,
      action_config JSONB NOT NULL,
      order_index INTEGER DEFAULT 0,
      delay_minutes INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name, _schema_name);

  -- Workflow execution log
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.workflow_executions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workflow_id UUID NOT NULL REFERENCES %I.workflows(id) ON DELETE CASCADE,
      candidate_id UUID REFERENCES %I.candidates(id) ON DELETE CASCADE,
      application_id UUID REFERENCES %I.applications(id) ON DELETE CASCADE,
      status TEXT DEFAULT ''pending'',
      trigger_data JSONB,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      completed_at TIMESTAMP WITH TIME ZONE,
      error_message TEXT
    )
  ', _schema_name, _schema_name, _schema_name, _schema_name);

  -- Email sequences table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.email_sequences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_by UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name);

  -- Email sequence steps
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.email_sequence_steps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sequence_id UUID NOT NULL REFERENCES %I.email_sequences(id) ON DELETE CASCADE,
      step_order INTEGER NOT NULL,
      delay_days INTEGER DEFAULT 0,
      template_id UUID REFERENCES %I.email_templates(id),
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name, _schema_name, _schema_name);

  -- Email sequence subscriptions
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.email_sequence_subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sequence_id UUID NOT NULL REFERENCES %I.email_sequences(id) ON DELETE CASCADE,
      candidate_id UUID NOT NULL REFERENCES %I.candidates(id) ON DELETE CASCADE,
      current_step INTEGER DEFAULT 0,
      status TEXT DEFAULT ''active'',
      started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      completed_at TIMESTAMP WITH TIME ZONE,
      last_sent_at TIMESTAMP WITH TIME ZONE
    )
  ', _schema_name, _schema_name, _schema_name);

  -- Add indexes
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_workflows_status ON %I.workflows(status)', _schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_workflow_actions_workflow ON %I.workflow_actions(workflow_id)', _schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON %I.workflow_executions(workflow_id)', _schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_email_sequences_active ON %I.email_sequences(is_active)', _schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_email_sequence_subscriptions_candidate ON %I.email_sequence_subscriptions(candidate_id)', _schema_name);

  -- Add triggers for updated_at
  EXECUTE format('
    DROP TRIGGER IF EXISTS update_workflows_updated_at ON %I.workflows
  ', _schema_name);
  
  EXECUTE format('
    CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON %I.workflows
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()
  ', _schema_name);

  EXECUTE format('
    DROP TRIGGER IF EXISTS update_email_sequences_updated_at ON %I.email_sequences
  ', _schema_name);
  
  EXECUTE format('
    CREATE TRIGGER update_email_sequences_updated_at
    BEFORE UPDATE ON %I.email_sequences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()
  ', _schema_name);
END;
$$;

-- Add workflow tables to all existing organizations
DO $$
DECLARE
  org_schema TEXT;
BEGIN
  FOR org_schema IN SELECT schema_name FROM public.organizations
  LOOP
    PERFORM add_workflows_to_org_schema(org_schema);
  END LOOP;
END $$;

-- Functions to manage workflows
CREATE OR REPLACE FUNCTION public.get_org_workflows(_user_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  status workflow_status,
  trigger_type workflow_trigger_type,
  trigger_config JSONB,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  action_count BIGINT
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
    SELECT w.id, w.name, w.description, w.status, w.trigger_type, w.trigger_config,
           w.created_by, w.created_at, w.updated_at,
           COUNT(wa.id) as action_count
    FROM %I.workflows w
    LEFT JOIN %I.workflow_actions wa ON w.id = wa.workflow_id
    GROUP BY w.id
    ORDER BY w.created_at DESC
  ', _schema_name, _schema_name);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_workflow_actions(_user_id UUID, _workflow_id UUID)
RETURNS TABLE(
  id UUID,
  workflow_id UUID,
  action_type workflow_action_type,
  action_config JSONB,
  order_index INTEGER,
  delay_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
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
    SELECT id, workflow_id, action_type, action_config, order_index, delay_minutes, created_at
    FROM %I.workflow_actions
    WHERE workflow_id = $1
    ORDER BY order_index ASC
  ', _schema_name) USING _workflow_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_workflow(
  _user_id UUID,
  _name TEXT,
  _description TEXT,
  _trigger_type workflow_trigger_type,
  _trigger_config JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name TEXT;
  _workflow_id UUID;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  _workflow_id := gen_random_uuid();

  EXECUTE format('
    INSERT INTO %I.workflows (id, name, description, trigger_type, trigger_config, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
  ', _schema_name) USING _workflow_id, _name, _description, _trigger_type, _trigger_config, _user_id;

  RETURN _workflow_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_workflow_action(
  _user_id UUID,
  _workflow_id UUID,
  _action_type workflow_action_type,
  _action_config JSONB,
  _order_index INTEGER DEFAULT 0,
  _delay_minutes INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name TEXT;
  _action_id UUID;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  _action_id := gen_random_uuid();

  EXECUTE format('
    INSERT INTO %I.workflow_actions (id, workflow_id, action_type, action_config, order_index, delay_minutes)
    VALUES ($1, $2, $3, $4, $5, $6)
  ', _schema_name) USING _action_id, _workflow_id, _action_type, _action_config, _order_index, _delay_minutes;

  RETURN _action_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_workflow_status(
  _user_id UUID,
  _workflow_id UUID,
  _status workflow_status
)
RETURNS VOID
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
    UPDATE %I.workflows
    SET status = $1, updated_at = now()
    WHERE id = $2
  ', _schema_name) USING _status, _workflow_id;
END;
$$;

-- Email sequence functions
CREATE OR REPLACE FUNCTION public.get_org_email_sequences(_user_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  is_active BOOLEAN,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  step_count BIGINT
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
    SELECT es.id, es.name, es.description, es.is_active, es.created_by, 
           es.created_at, es.updated_at,
           COUNT(ess.id) as step_count
    FROM %I.email_sequences es
    LEFT JOIN %I.email_sequence_steps ess ON es.id = ess.sequence_id
    GROUP BY es.id
    ORDER BY es.created_at DESC
  ', _schema_name, _schema_name);
END;
$$;