import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getSubdomain } from '@/utils/subdomain';

interface OrganizationBranding {
  id: string;
  name: string;
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  subdomain: string | null;
  schema_name: string;
}

export const useOrganizationBySubdomain = () => {
  const subdomain = getSubdomain();

  return useQuery({
    queryKey: ['organization-by-subdomain', subdomain],
    queryFn: async () => {
      if (!subdomain) return null;

      const { data, error } = await supabase.rpc('get_organization_by_subdomain', {
        _subdomain: subdomain
      });

      if (error) throw error;
      return data?.[0] as OrganizationBranding | null;
    },
    enabled: !!subdomain
  });
};
