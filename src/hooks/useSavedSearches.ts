import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: any;
  search_type: string;
  created_at: string;
  updated_at: string;
}

export function useSavedSearches(searchType: string = 'candidate') {
  const { user } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSavedSearches = async () => {
    if (!user) {
      setSavedSearches([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_saved_searches', {
        _user_id: user.id,
        _search_type: searchType
      });

      if (error) throw error;
      setSavedSearches((data || []) as SavedSearch[]);
    } catch (err) {
      console.error('Error fetching saved searches:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedSearches();
  }, [user, searchType]);

  const createSavedSearch = async (
    name: string,
    filters: any
  ) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('create_saved_search', {
      _user_id: user.id,
      _name: name,
      _filters: filters,
      _search_type: searchType
    });

    if (error) throw error;
    await fetchSavedSearches();
    return data;
  };

  const deleteSavedSearch = async (searchId: string) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('delete_saved_search', {
      _user_id: user.id,
      _search_id: searchId
    });

    if (error) throw error;
    await fetchSavedSearches();
  };

  return { 
    savedSearches, 
    loading, 
    error, 
    createSavedSearch, 
    deleteSavedSearch,
    refetch: fetchSavedSearches 
  };
}