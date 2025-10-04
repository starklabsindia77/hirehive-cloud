import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Organization {
  id: string;
  name: string;
  schema_name: string;
  brand_name?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  plan?: {
    ai_tokens_monthly: number;
    email_credits_monthly: number;
    storage_gb: number;
    features: Record<string, boolean>;
  };
}

interface UsageSummary {
  ai_tokens_remaining: number;
  email_credits_remaining: number;
  storage_bytes_remaining: number;
}

interface OrganizationContextType {
  organization: Organization | null;
  subscription: Subscription | null;
  usage: UsageSummary | null;
  loading: boolean;
  refreshOrganization: () => Promise<void>;
  canUseFeature: (feature: string) => boolean;
  hasRemainingTokens: (type: 'ai_tokens' | 'email_credits' | 'storage') => boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrganization = async () => {
    if (!user) {
      setOrganization(null);
      setSubscription(null);
      setUsage(null);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (profile?.organization_id) {
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();

      setOrganization(org);

      // Fetch subscription
      const { data: sub } = await supabase
        .from('organization_subscriptions')
        .select(`
          *,
          plan:subscription_plans(ai_tokens_monthly, email_credits_monthly, storage_gb, features)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (sub) {
        setSubscription({
          id: sub.id,
          plan_id: sub.plan_id,
          status: sub.status as 'active' | 'cancelled' | 'expired' | 'trial',
          plan: sub.plan ? {
            ai_tokens_monthly: sub.plan.ai_tokens_monthly,
            email_credits_monthly: sub.plan.email_credits_monthly,
            storage_gb: sub.plan.storage_gb,
            features: (sub.plan.features || {}) as Record<string, boolean>,
          } : undefined,
        });
      }

      // Fetch usage summary
      const { data: usageSummary } = await supabase
        .rpc('get_usage_summary', { _org_id: profile.organization_id });

      setUsage(usageSummary?.[0] || null);
    }
    setLoading(false);
  };

  const canUseFeature = (feature: string): boolean => {
    if (!subscription?.plan) return false;
    return subscription.plan.features[feature] === true;
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

  useEffect(() => {
    fetchOrganization();
  }, [user]);

  return (
    <OrganizationContext.Provider 
      value={{ 
        organization, 
        subscription,
        usage,
        loading, 
        refreshOrganization: fetchOrganization,
        canUseFeature,
        hasRemainingTokens,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
