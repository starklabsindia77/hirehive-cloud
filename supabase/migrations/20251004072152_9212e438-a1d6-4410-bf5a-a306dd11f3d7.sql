-- Add branding fields to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#0ea5e9',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#8b5cf6',
ADD COLUMN IF NOT EXISTS brand_name TEXT;

-- Create RLS policy for owners and admins to update branding
CREATE POLICY "Owners and admins can update organization branding"
ON public.organizations
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'))
  AND id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
);