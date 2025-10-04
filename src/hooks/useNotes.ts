import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Note {
  id: string;
  candidate_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useNotes(candidateId: string) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotes = async () => {
    if (!user || !candidateId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_org_notes', {
        _user_id: user.id,
        _candidate_id: candidateId
      });

      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user, candidateId]);

  const createNote = async (content: string) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('create_org_note', {
      _user_id: user.id,
      _candidate_id: candidateId,
      _content: content
    });

    if (error) throw error;
    await fetchNotes();
    return data;
  };

  return { notes, loading, error, createNote, refetch: fetchNotes };
}
