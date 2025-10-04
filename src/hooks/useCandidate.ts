import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganizationSchema } from './useOrganizationSchema';
import { Candidate } from './useCandidates';

export function useCandidate(candidateId: string) {
  const { schema, loading: schemaLoading } = useOrganizationSchema();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCandidate() {
      if (schemaLoading) return;
      
      if (!schema || !candidateId) {
        setCandidate(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .schema(schema)
          .from('candidates')
          .select('*')
          .eq('id', candidateId)
          .single();

        if (error) throw error;
        setCandidate(data);
      } catch (err) {
        console.error('Error fetching candidate:', err);
        setError(err as Error);
        setCandidate(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCandidate();
  }, [schema, schemaLoading, candidateId]);

  return { candidate, loading: loading || schemaLoading, error };
}
