import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganizationSchema } from './useOrganizationSchema';
import { Job } from './useJobs';

export function useJob(jobId: string) {
  const { schema, loading: schemaLoading } = useOrganizationSchema();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchJob() {
      if (schemaLoading) return;
      
      if (!schema || !jobId) {
        setJob(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .schema(schema)
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) throw error;
        setJob(data);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError(err as Error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [schema, schemaLoading, jobId]);

  return { job, loading: loading || schemaLoading, error };
}
