-- Add notifications table to organization schemas
CREATE OR REPLACE FUNCTION public.add_notifications_to_org_schema(_schema_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      related_id UUID,
      related_type TEXT,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ', _schema_name);

  EXECUTE format('
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON %I.notifications(user_id, is_read, created_at DESC)
  ', _schema_name);
END;
$$;

-- Apply to all existing organizations
DO $$
DECLARE
  org_schema text;
BEGIN
  FOR org_schema IN SELECT schema_name FROM public.organizations LOOP
    PERFORM public.add_notifications_to_org_schema(org_schema);
  END LOOP;
END $$;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid,
  _target_user_id uuid,
  _title text,
  _message text,
  _type text,
  _related_id uuid DEFAULT NULL,
  _related_type text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name text;
  _notification_id uuid;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  _notification_id := gen_random_uuid();

  EXECUTE format('
    INSERT INTO %I.notifications (id, user_id, title, message, type, related_id, related_type)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  ', _schema_name) USING _notification_id, _target_user_id, _title, _message, _type, _related_id, _related_type;

  RETURN _notification_id;
END;
$$;

-- Function to get notifications
CREATE OR REPLACE FUNCTION public.get_user_notifications(
  _user_id uuid,
  _unread_only boolean DEFAULT false,
  _limit integer DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  title text,
  message text,
  type text,
  related_id uuid,
  related_type text,
  is_read boolean,
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
    SELECT id, user_id, title, message, type, related_id, related_type, is_read, created_at
    FROM %I.notifications
    WHERE user_id = $1
  ', _schema_name);

  IF _unread_only THEN
    _sql := _sql || ' AND is_read = false';
  END IF;

  _sql := _sql || ' ORDER BY created_at DESC LIMIT $2';

  RETURN QUERY EXECUTE _sql USING _user_id, _limit;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(
  _user_id uuid,
  _notification_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name text;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  EXECUTE format('
    UPDATE %I.notifications
    SET is_read = true
    WHERE id = $1 AND user_id = $2
  ', _schema_name) USING _notification_id, _user_id;
END;
$$;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _schema_name text;
BEGIN
  SELECT get_user_org_schema(_user_id) INTO _schema_name;
  
  IF _schema_name IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  EXECUTE format('
    UPDATE %I.notifications
    SET is_read = true
    WHERE user_id = $1 AND is_read = false
  ', _schema_name) USING _user_id;
END;
$$;