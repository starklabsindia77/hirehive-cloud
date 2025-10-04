import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UsageType = 
  | 'ai_parse_resume'
  | 'ai_generate_job_desc'
  | 'ai_match_candidates'
  | 'email_send'
  | 'email_bulk_send'
  | 'storage_upload';

export interface UsageRecord {
  id: string;
  organization_id: string;
  user_id?: string;
  usage_type: UsageType;
  tokens_used: number;
  credits_used: number;
  bytes_used: number;
  metadata: Record<string, any>;
  created_at: string;
}

export const useUsageTracking = (
  organizationId?: string,
  periodStart?: Date,
  periodEnd?: Date
) => {
  const { user } = useAuth();

  // Fetch usage breakdown
  const { data: usageBreakdown, isLoading } = useQuery({
    queryKey: ['usage-tracking', organizationId, periodStart, periodEnd],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase.rpc('get_organization_usage', {
        _org_id: organizationId,
        _period_start: periodStart?.toISOString() || null,
        _period_end: periodEnd?.toISOString() || null,
      });

      if (error) throw error;
      return data as Array<{
        usage_type: UsageType;
        total_tokens: number;
        total_credits: number;
        total_bytes: number;
        count: number;
      }>;
    },
    enabled: !!user && !!organizationId,
  });

  // Fetch detailed usage records
  const { data: usageRecords } = useQuery({
    queryKey: ['usage-records', organizationId, periodStart, periodEnd],
    queryFn: async () => {
      if (!organizationId) return [];
      
      let query = supabase
        .from('usage_tracking')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (periodStart) {
        query = query.gte('created_at', periodStart.toISOString());
      }
      if (periodEnd) {
        query = query.lte('created_at', periodEnd.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UsageRecord[];
    },
    enabled: !!user && !!organizationId,
  });

  return {
    usageBreakdown,
    usageRecords,
    isLoading,
  };
};
