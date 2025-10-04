import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Comment {
  id: string;
  candidate_id: string;
  author_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export function useComments(candidateId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    if (!user || !candidateId) return;

    try {
      const { data, error } = await supabase.rpc('get_candidate_comments', {
        _user_id: user.id,
        _candidate_id: candidateId
      });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [user, candidateId]);

  const createComment = async (content: string, isInternal: boolean = true) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('create_candidate_comment', {
      _user_id: user.id,
      _candidate_id: candidateId,
      _content: content,
      _is_internal: isInternal
    });

    if (error) throw error;
    await fetchComments();
  };

  return { comments, loading, createComment, refetch: fetchComments };
}
