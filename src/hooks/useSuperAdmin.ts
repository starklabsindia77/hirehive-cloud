import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Organization {
  id: string;
  name: string;
  schema_name: string;
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  custom_header_code: string | null;
  custom_footer_code: string | null;
  subdomain: string | null;
  created_at: string;
  current_subscription_id: string | null;
  plan_name: string | null;
  plan_price: number | null;
}

export interface OrganizationFeature {
  id: string;
  organization_id: string;
  feature_key: string;
  is_enabled: boolean;
  custom_limit: number | null;
  notes: string | null;
  enabled_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useSuperAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: organizations, isLoading: loadingOrgs } = useQuery({
    queryKey: ['all-organizations'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('get_all_organizations');

      if (error) throw error;
      return data as Organization[];
    },
    enabled: !!user
  });

  const toggleFeature = useMutation({
    mutationFn: async (params: {
      organizationId: string;
      featureKey: string;
      isEnabled: boolean;
      customLimit?: number;
      notes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('toggle_organization_feature', {
        _organization_id: params.organizationId,
        _feature_key: params.featureKey,
        _is_enabled: params.isEnabled,
        _custom_limit: params.customLimit || null,
        _notes: params.notes || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-features'] });
      toast({
        title: 'Success',
        description: 'Feature updated successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const createCustomPlan = useMutation({
    mutationFn: async (params: {
      organizationId: string;
      name: string;
      priceMonthly: number;
      priceYearly: number;
      aiTokensMonthly: number;
      emailCreditsMonthly: number;
      storageGb: number;
      teamMembersLimit: number;
      jobsLimit: number;
      candidatesLimit: number;
      features?: Record<string, any>;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('create_custom_plan', {
        _organization_id: params.organizationId,
        _name: params.name,
        _price_monthly: params.priceMonthly,
        _price_yearly: params.priceYearly,
        _ai_tokens_monthly: params.aiTokensMonthly,
        _email_credits_monthly: params.emailCreditsMonthly,
        _storage_gb: params.storageGb,
        _team_members_limit: params.teamMembersLimit,
        _jobs_limit: params.jobsLimit,
        _candidates_limit: params.candidatesLimit,
        _features: params.features || {}
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-organizations'] });
      toast({
        title: 'Success',
        description: 'Custom enterprise plan created successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    organizations,
    loadingOrgs,
    toggleFeature,
    createCustomPlan
  };
};

export const useOrganizationFeatures = (organizationId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['organization-features', organizationId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('get_organization_features', {
        _organization_id: organizationId
      });

      if (error) throw error;
      return data as OrganizationFeature[];
    },
    enabled: !!user && !!organizationId
  });
};
