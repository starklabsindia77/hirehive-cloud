import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Activity {
  id: string;
  candidate_id: string | null;
  job_id: string | null;
  user_id: string;
  activity_type: string;
  description: string;
  metadata: any | null;
  created_at: string;
}

export function useActivities(candidateId?: string, jobId?: string) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActivities = async () => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_org_activities', {
        _user_id: user.id,
        _candidate_id: candidateId || null,
        _job_id: jobId || null
      });

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user, candidateId, jobId]);

  const logActivity = async (
    activityType: string,
    description: string,
    candidateId?: string,
    jobId?: string,
    metadata?: any
  ) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('log_org_activity', {
      _user_id: user.id,
      _activity_type: activityType,
      _description: description,
      _candidate_id: candidateId || null,
      _job_id: jobId || null,
      _metadata: metadata || null
    });

    if (error) throw error;
    await fetchActivities();
    return data;
  };

  return { activities, loading, error, logActivity, refetch: fetchActivities };
}
