import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganizationSchema } from './useOrganizationSchema';

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
  const { schema, loading: schemaLoading } = useOrganizationSchema();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      if (schemaLoading) return;
      
      if (!schema) {
        setJobs([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .schema(schema)
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

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
  }, [schema, schemaLoading]);

  const refetch = async () => {
    if (!schema) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .schema(schema)
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error refetching jobs:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { jobs, loading: loading || schemaLoading, error, refetch };
}
