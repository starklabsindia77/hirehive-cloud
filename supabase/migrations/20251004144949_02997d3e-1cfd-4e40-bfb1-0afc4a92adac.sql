-- Create offer_templates function to add to org schemas
CREATE OR REPLACE FUNCTION public.add_offer_templates_to_org_schema(_schema_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Offer templates table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.offer_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      template_content TEXT NOT NULL,
      default_compensation JSONB,
      default_benefits TEXT[],
      is_active BOOLEAN DEFAULT true,
      created_by UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name);

  -- Offers table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.offers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id UUID NOT NULL REFERENCES %I.applications(id) ON DELETE CASCADE,
      candidate_id UUID NOT NULL REFERENCES %I.candidates(id) ON DELETE CASCADE,
      job_id UUID NOT NULL REFERENCES %I.jobs(id) ON DELETE CASCADE,
      template_id UUID REFERENCES %I.offer_templates(id),
      offer_letter_content TEXT NOT NULL,
      job_title TEXT NOT NULL,
      department TEXT,
      start_date DATE,
      salary_amount DECIMAL(12, 2),
      salary_currency TEXT DEFAULT ''USD'',
      salary_frequency TEXT DEFAULT ''annual'',
      bonus_amount DECIMAL(12, 2),
      equity_amount TEXT,
      benefits TEXT[],
      additional_terms TEXT,
      status TEXT DEFAULT ''draft'' CHECK (status IN (''draft'', ''pending_approval'', ''approved'', ''sent'', ''accepted'', ''declined'', ''expired'', ''withdrawn'')),
      approval_level INTEGER DEFAULT 0,
      required_approval_levels INTEGER DEFAULT 1,
      sent_at TIMESTAMP WITH TIME ZONE,
      accepted_at TIMESTAMP WITH TIME ZONE,
      declined_at TIMESTAMP WITH TIME ZONE,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_by UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name, _schema_name, _schema_name, _schema_name, _schema_name);

  -- Offer approvals table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.offer_approvals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      offer_id UUID NOT NULL REFERENCES %I.offers(id) ON DELETE CASCADE,
      approver_id UUID NOT NULL,
      approval_level INTEGER NOT NULL,
      status TEXT DEFAULT ''pending'' CHECK (status IN (''pending'', ''approved'', ''rejected'')),
      comments TEXT,
      approved_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name, _schema_name);

  -- Offer history table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.offer_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      offer_id UUID NOT NULL REFERENCES %I.offers(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      actor_id UUID NOT NULL,
      previous_status TEXT,
      new_status TEXT,
      changes JSONB,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name, _schema_name);

  -- Add indexes
  EXECUTE format('
    CREATE INDEX IF NOT EXISTS idx_offers_application ON %I.offers(application_id)
  ', _schema_name);
  
  EXECUTE format('
    CREATE INDEX IF NOT EXISTS idx_offers_candidate ON %I.offers(candidate_id)
  ', _schema_name);
  
  EXECUTE format('
    CREATE INDEX IF NOT EXISTS idx_offers_status ON %I.offers(status)
  ', _schema_name);

  EXECUTE format('
    CREATE INDEX IF NOT EXISTS idx_offer_approvals_offer ON %I.offer_approvals(offer_id)
  ', _schema_name);

  -- Add triggers for updated_at
  EXECUTE format('
    DROP TRIGGER IF EXISTS update_offer_templates_updated_at ON %I.offer_templates
  ', _schema_name);
  
  EXECUTE format('
    CREATE TRIGGER update_offer_templates_updated_at
    BEFORE UPDATE ON %I.offer_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()
  ', _schema_name);

  EXECUTE format('
    DROP TRIGGER IF EXISTS update_offers_updated_at ON %I.offers
  ', _schema_name);
  
  EXECUTE format('
    CREATE TRIGGER update_offers_updated_at
    BEFORE UPDATE ON %I.offers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()
  ', _schema_name);
END;
$$;

-- Add offer tables to existing organization schemas
DO $$
DECLARE
  _schema_record RECORD;
BEGIN
  FOR _schema_record IN SELECT schema_name FROM public.organizations LOOP
    PERFORM public.add_offer_templates_to_org_schema(_schema_record.schema_name);
  END LOOP;
END $$;

-- Function to create offer
CREATE OR REPLACE FUNCTION public.create_offer(
  _user_id uuid,
  _application_id uuid,
  _candidate_id uuid,
  _job_id uuid,
  _offer_letter_content text,
  _job_title text,
  _start_date date,
  _salary_amount decimal,
  _salary_currency text DEFAULT 'USD',
  _benefits text[] DEFAULT NULL,
  _required_approval_levels integer DEFAULT 1
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name text;
  _offer_id uuid;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  _offer_id := gen_random_uuid();

  EXECUTE format('
    INSERT INTO %I.offers (
      id, application_id, candidate_id, job_id, offer_letter_content,
      job_title, start_date, salary_amount, salary_currency, benefits,
      required_approval_levels, expires_at, created_by, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  ', _schema_name) USING 
    _offer_id, _application_id, _candidate_id, _job_id, _offer_letter_content,
    _job_title, _start_date, _salary_amount, _salary_currency, _benefits,
    _required_approval_levels, now() + interval '30 days', _user_id, 'draft';

  RETURN _offer_id;
END;
$$;

-- Function to get offers
CREATE OR REPLACE FUNCTION public.get_offers(
  _user_id uuid,
  _candidate_id uuid DEFAULT NULL,
  _status text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  application_id uuid,
  candidate_id uuid,
  job_id uuid,
  offer_letter_content text,
  job_title text,
  department text,
  start_date date,
  salary_amount decimal,
  salary_currency text,
  benefits text[],
  status text,
  approval_level integer,
  required_approval_levels integer,
  sent_at timestamp with time zone,
  accepted_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    SELECT id, application_id, candidate_id, job_id, offer_letter_content,
           job_title, department, start_date, salary_amount, salary_currency,
           benefits, status, approval_level, required_approval_levels,
           sent_at, accepted_at, expires_at, created_at
    FROM %I.offers
    WHERE 1=1
  ', _schema_name);

  IF _candidate_id IS NOT NULL THEN
    _sql := _sql || format(' AND candidate_id = %L', _candidate_id);
  END IF;

  IF _status IS NOT NULL THEN
    _sql := _sql || format(' AND status = %L', _status);
  END IF;

  _sql := _sql || ' ORDER BY created_at DESC';

  RETURN QUERY EXECUTE _sql;
END;
$$;

-- Function to update offer status
CREATE OR REPLACE FUNCTION public.update_offer_status(
  _user_id uuid,
  _offer_id uuid,
  _new_status text,
  _notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name text;
  _old_status text;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  -- Get current status
  EXECUTE format('SELECT status FROM %I.offers WHERE id = $1', _schema_name) 
  INTO _old_status USING _offer_id;

  -- Update offer status
  EXECUTE format('
    UPDATE %I.offers
    SET status = $1,
        sent_at = CASE WHEN $1 = ''sent'' THEN now() ELSE sent_at END,
        accepted_at = CASE WHEN $1 = ''accepted'' THEN now() ELSE accepted_at END,
        declined_at = CASE WHEN $1 = ''declined'' THEN now() ELSE declined_at END
    WHERE id = $2
  ', _schema_name) USING _new_status, _offer_id;

  -- Log to history
  EXECUTE format('
    INSERT INTO %I.offer_history (offer_id, action, actor_id, previous_status, new_status, notes)
    VALUES ($1, $2, $3, $4, $5, $6)
  ', _schema_name) USING _offer_id, 'status_change', _user_id, _old_status, _new_status, _notes;
END;
$$;