import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganizationSchema } from './useOrganizationSchema';

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  resume_url: string | null;
  current_company: string | null;
  current_position: string | null;
  experience_years: number | null;
  skills: string[] | null;
  status: string;
  stage: string;
  created_at: string;
  updated_at: string;
}

export function useCandidates() {
  const { schema, loading: schemaLoading } = useOrganizationSchema();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCandidates() {
      if (schemaLoading) return;
      
      if (!schema) {
        setCandidates([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .schema(schema)
          .from('candidates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCandidates(data || []);
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchCandidates();
  }, [schema, schemaLoading]);

  const refetch = async () => {
    if (!schema) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .schema(schema)
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error('Error refetching candidates:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { candidates, loading: loading || schemaLoading, error, refetch };
}
