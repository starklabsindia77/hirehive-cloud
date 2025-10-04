import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  ai_tokens_monthly: number;
  email_credits_monthly: number;
  storage_gb: number;
  team_members_limit: number;
  jobs_limit: number;
  candidates_limit: number;
  features: Record<string, boolean>;
  is_active: boolean;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  current_period_start: string;
  current_period_end: string;
  trial_ends_at?: string;
  cancelled_at?: string;
  plan?: SubscriptionPlan;
}

export interface UsageSummary {
  ai_tokens_used: number;
  ai_tokens_remaining: number;
  ai_tokens_limit: number;
  email_credits_used: number;
  email_credits_remaining: number;
  email_credits_limit: number;
  storage_bytes_used: number;
  storage_bytes_remaining: number;
  storage_bytes_limit: number;
  period_start: string;
  period_end: string;
}

export const useSubscription = (organizationId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_available_plans');
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
    enabled: !!user,
  });

  // Fetch current subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      const { data, error } = await supabase
        .from('organization_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data as Subscription & { plan: SubscriptionPlan };
    },
    enabled: !!user && !!organizationId,
  });

  // Fetch usage summary
  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ['usage-summary', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      const { data, error } = await supabase.rpc('get_usage_summary', {
        _org_id: organizationId,
      });

      if (error) throw error;
      return data?.[0] as UsageSummary;
    },
    enabled: !!user && !!organizationId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: async (newPlanId: string) => {
      if (!organizationId) throw new Error('No organization ID');
      
      const { data, error } = await supabase.rpc('upgrade_subscription', {
        _org_id: organizationId,
        _new_plan_id: newPlanId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['usage-summary', organizationId] });
      toast({
        title: 'Plan upgraded',
        description: 'Your subscription has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upgrade failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const isFeatureEnabled = (feature: string): boolean => {
    if (!subscription?.plan) return false;
    return subscription.plan.features[feature] === true;
  };

  const getUsagePercentage = (type: 'ai_tokens' | 'email_credits' | 'storage') => {
    if (!usage) return 0;
    
    if (type === 'ai_tokens') {
      return (usage.ai_tokens_used / usage.ai_tokens_limit) * 100;
    } else if (type === 'email_credits') {
      return (usage.email_credits_used / usage.email_credits_limit) * 100;
    } else {
      return (usage.storage_bytes_used / usage.storage_bytes_limit) * 100;
    }
  };

  const hasRemainingTokens = (type: 'ai_tokens' | 'email_credits' | 'storage'): boolean => {
    if (!usage) return false;
    
    if (type === 'ai_tokens') {
      return usage.ai_tokens_remaining > 0;
    } else if (type === 'email_credits') {
      return usage.email_credits_remaining > 0;
    } else {
      return usage.storage_bytes_remaining > 0;
    }
  };

  return {
    plans,
    subscription,
    usage,
    isLoading: plansLoading || subscriptionLoading || usageLoading,
    upgradeSubscription: upgradeMutation.mutate,
    isUpgrading: upgradeMutation.isPending,
    isFeatureEnabled,
    getUsagePercentage,
    hasRemainingTokens,
  };
};
