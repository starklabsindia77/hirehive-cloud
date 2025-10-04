import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganizationSchema } from './useOrganizationSchema';

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string;
  stage: string;
  notes: string | null;
  applied_at: string;
  updated_at: string;
}

export function useApplications(jobId?: string, candidateId?: string) {
  const { schema, loading: schemaLoading } = useOrganizationSchema();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      if (schemaLoading) return;
      
      if (!schema) {
        setApplications([]);
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .schema(schema)
          .from('applications')
          .select('*');

        if (jobId) {
          query = query.eq('job_id', jobId);
        }
        
        if (candidateId) {
          query = query.eq('candidate_id', candidateId);
        }

        query = query.order('applied_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        setApplications(data || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [schema, schemaLoading, jobId, candidateId]);

  const refetch = async () => {
    if (!schema) return;
    
    setLoading(true);
    try {
      let query = supabase
        .schema(schema)
        .from('applications')
        .select('*');

      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      
      if (candidateId) {
        query = query.eq('candidate_id', candidateId);
      }

      query = query.order('applied_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error refetching applications:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { applications, loading: loading || schemaLoading, error, refetch };
}
