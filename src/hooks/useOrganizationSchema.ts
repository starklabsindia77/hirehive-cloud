import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useOrganizationSchema() {
  const { user } = useAuth();
  const [schema, setSchema] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchema() {
      if (!user) {
        setSchema(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_user_org_schema', {
          _user_id: user.id
        });

        if (error) throw error;
        setSchema(data);
      } catch (error) {
        console.error('Error fetching organization schema:', error);
        setSchema(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSchema();
  }, [user]);

  return { schema, loading };
}
