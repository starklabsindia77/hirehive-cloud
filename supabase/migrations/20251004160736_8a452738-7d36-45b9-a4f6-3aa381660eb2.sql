-- Add custom header and footer code fields to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS custom_header_code TEXT,
ADD COLUMN IF NOT EXISTS custom_footer_code TEXT;

COMMENT ON COLUMN public.organizations.custom_header_code IS 'Custom HTML/JS code to inject in header';
COMMENT ON COLUMN public.organizations.custom_footer_code IS 'Custom HTML/JS code to inject in footer';