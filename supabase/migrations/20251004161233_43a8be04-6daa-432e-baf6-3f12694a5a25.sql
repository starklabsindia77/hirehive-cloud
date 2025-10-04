-- Create platform settings table for global branding
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name TEXT DEFAULT 'NexHire',
  platform_logo_url TEXT,
  primary_color TEXT DEFAULT '#0ea5e9',
  secondary_color TEXT DEFAULT '#8b5cf6',
  favicon_url TEXT,
  login_page_title TEXT,
  login_page_subtitle TEXT,
  custom_css TEXT,
  custom_header_code TEXT,
  custom_footer_code TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.platform_settings (platform_name)
VALUES ('NexHire')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view platform settings
CREATE POLICY "Anyone can view platform settings"
  ON public.platform_settings
  FOR SELECT
  USING (true);

-- Policy: Only super admins can update platform settings
CREATE POLICY "Super admins can update platform settings"
  ON public.platform_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Function to get platform settings
CREATE OR REPLACE FUNCTION public.get_platform_settings()
RETURNS TABLE(
  id UUID,
  platform_name TEXT,
  platform_logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  favicon_url TEXT,
  login_page_title TEXT,
  login_page_subtitle TEXT,
  custom_css TEXT,
  custom_header_code TEXT,
  custom_footer_code TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    id, platform_name, platform_logo_url, primary_color, secondary_color,
    favicon_url, login_page_title, login_page_subtitle, custom_css,
    custom_header_code, custom_footer_code, updated_at
  FROM public.platform_settings
  LIMIT 1;
$$;