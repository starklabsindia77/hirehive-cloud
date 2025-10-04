import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export function useCandidates() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCandidates() {
      if (!user) {
        setCandidates([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_org_candidates', {
          _user_id: user.id
        });

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
  }, [user]);

  const refetch = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_org_candidates', {
        _user_id: user.id
      });

      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error('Error refetching candidates:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { candidates, loading, error, refetch };
}
