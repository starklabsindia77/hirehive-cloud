import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      if (!user) {
        setApplications([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_org_applications', {
          _user_id: user.id,
          _job_id: jobId || null,
          _candidate_id: candidateId || null
        });

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
  }, [user, jobId, candidateId]);

  const refetch = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_org_applications', {
        _user_id: user.id,
        _job_id: jobId || null,
        _candidate_id: candidateId || null
      });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error refetching applications:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { applications, loading, error, refetch };
}
