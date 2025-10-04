-- Update the function to include proper search_path
CREATE OR REPLACE FUNCTION get_user_organization_id(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT organization_id FROM profiles WHERE user_id = user_uuid LIMIT 1;
$$;