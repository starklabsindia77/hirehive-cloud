-- Create RLS policy for super admins to view all organizations
CREATE POLICY "Super admins can view all organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- Create RLS policy for super admins to update all organizations
CREATE POLICY "Super admins can update all organizations"
ON public.organizations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- Create RLS policy for super admins to view all profiles
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- Create RLS policy for super admins to view all roles
CREATE POLICY "Super admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- Create RLS policy for super admins to manage all roles
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));
