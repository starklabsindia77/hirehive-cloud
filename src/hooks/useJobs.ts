import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Job {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  description: string | null;
  requirements: string | null;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      if (!user) {
        setJobs([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_org_jobs', {
          _user_id: user.id
        });

        if (error) throw error;
        setJobs(data || []);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [user]);

  const refetch = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_org_jobs', {
        _user_id: user.id
      });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error refetching jobs:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { jobs, loading, error, refetch };
}
