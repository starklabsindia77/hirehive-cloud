-- Create a function to get platform-wide statistics for super admin dashboard
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS TABLE (
  total_orgs BIGINT,
  total_users BIGINT,
  active_subscriptions BIGINT,
  total_revenue NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is super admin
  IF NOT has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.organizations)::BIGINT as total_orgs,
    (SELECT COUNT(*) FROM public.profiles)::BIGINT as total_users,
    (SELECT COUNT(*) FROM public.organization_subscriptions WHERE status = 'active')::BIGINT as active_subscriptions,
    (
      SELECT COALESCE(SUM(sp.price_monthly), 0)
      FROM public.organization_subscriptions os
      JOIN public.subscription_plans sp ON os.plan_id = sp.id
      WHERE os.status = 'active'
    )::NUMERIC as total_revenue;
END;
$$;