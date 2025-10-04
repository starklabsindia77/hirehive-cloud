import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Rating {
  id: string;
  candidate_id: string;
  reviewer_id: string;
  rating: number;
  category: string;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export function useRatings(candidateId: string) {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRatings = async () => {
    if (!user || !candidateId) return;

    try {
      const { data, error } = await supabase.rpc('get_candidate_ratings', {
        _user_id: user.id,
        _candidate_id: candidateId
      });

      if (error) throw error;
      setRatings(data || []);
    } catch (err) {
      console.error('Error fetching ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [user, candidateId]);

  const createRating = async (
    rating: number,
    category: string,
    feedback?: string
  ) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('create_candidate_rating', {
      _user_id: user.id,
      _candidate_id: candidateId,
      _rating: rating,
      _category: category,
      _feedback: feedback || null
    });

    if (error) throw error;
    await fetchRatings();
  };

  return { ratings, loading, createRating, refetch: fetchRatings };
}
