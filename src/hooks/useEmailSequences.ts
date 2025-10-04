import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EmailSequence {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  step_count: number;
}

export function useEmailSequences() {
  const { user } = useAuth();
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSequences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_org_email_sequences', {
        _user_id: user.id
      });

      if (error) throw error;
      setSequences(data || []);
    } catch (error) {
      console.error('Error fetching email sequences:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSequences();
  }, [user]);

  return {
    sequences,
    loading,
    refetch: fetchSequences
  };
}
