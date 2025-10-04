import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Job } from './useJobs';

export function useJob(jobId: string) {
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchJob() {
      if (!user || !jobId) {
        setJob(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_org_job', {
          _user_id: user.id,
          _job_id: jobId
        });

        if (error) throw error;
        setJob(data && data.length > 0 ? data[0] : null);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError(err as Error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [user, jobId]);

  return { job, loading, error };
}
