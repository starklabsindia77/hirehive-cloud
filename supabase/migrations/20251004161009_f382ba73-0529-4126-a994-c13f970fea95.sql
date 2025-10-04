-- Drop and recreate get_all_organizations function with custom header and footer code
DROP FUNCTION IF EXISTS public.get_all_organizations();

CREATE OR REPLACE FUNCTION public.get_all_organizations()
RETURNS TABLE(
  id UUID, 
  name TEXT, 
  schema_name TEXT, 
  brand_name TEXT, 
  logo_url TEXT,
  primary_color TEXT, 
  secondary_color TEXT,
  custom_header_code TEXT,
  custom_footer_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  current_subscription_id UUID, 
  plan_name TEXT, 
  plan_price NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.schema_name,
    o.brand_name,
    o.logo_url,
    o.primary_color,
    o.secondary_color,
    o.custom_header_code,
    o.custom_footer_code,
    o.created_at,
    o.current_subscription_id,
    sp.name as plan_name,
    sp.price_monthly as plan_price
  FROM public.organizations o
  LEFT JOIN public.organization_subscriptions os ON o.current_subscription_id = os.id
  LEFT JOIN public.subscription_plans sp ON os.plan_id = sp.id
  ORDER BY o.created_at DESC;
END;
$$;