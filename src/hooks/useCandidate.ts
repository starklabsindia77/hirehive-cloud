import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Candidate } from './useCandidates';

export function useCandidate(candidateId: string) {
  const { user } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCandidate = async () => {
    if (!user || !candidateId) {
      setCandidate(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_org_candidate', {
        _user_id: user.id,
        _candidate_id: candidateId
      });

      if (error) throw error;
      setCandidate(data && data.length > 0 ? data[0] : null);
    } catch (err) {
      console.error('Error fetching candidate:', err);
      setError(err as Error);
      setCandidate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [user, candidateId]);

  return { candidate, loading, error, refetch: fetchCandidate };
}
