-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;

-- Create a function to get user's organization_id without RLS recursion
CREATE OR REPLACE FUNCTION get_user_organization_id(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM profiles WHERE user_id = user_uuid LIMIT 1;
$$;

-- Recreate the policy using the function to avoid recursion
CREATE POLICY "Users can view profiles in their organization"
ON profiles
FOR SELECT
USING (
  organization_id = get_user_organization_id(auth.uid())
  OR user_id = auth.uid()
);