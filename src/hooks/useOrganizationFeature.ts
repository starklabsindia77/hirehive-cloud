import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';

export function useOrganizationFeature(featureKey: string) {
  const { user } = useAuth();
  const { organization } = useOrganization();

  const { data: featureStatus, isLoading } = useQuery({
    queryKey: ['org-feature', organization?.id, featureKey],
    queryFn: async () => {
      if (!user || !organization) return { enabled: true, limit: null };

      const { data, error } = await supabase
        .from('organization_features')
        .select('is_enabled, custom_limit')
        .eq('organization_id', organization.id)
        .eq('feature_key', featureKey)
        .maybeSingle();

      if (error) {
        console.error('Error checking feature:', error);
        return { enabled: true, limit: null };
      }

      // If no custom feature setting exists, default to enabled
      if (!data) {
        return { enabled: true, limit: null };
      }

      return {
        enabled: data.is_enabled,
        limit: data.custom_limit
      };
    },
    enabled: !!user && !!organization
  });

  return {
    isEnabled: featureStatus?.enabled ?? true,
    customLimit: featureStatus?.limit ?? null,
    isLoading
  };
}
