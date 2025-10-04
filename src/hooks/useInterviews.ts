import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Interview {
  id: string;
  application_id: string;
  scheduled_at: string;
  duration_minutes: number;
  interview_type: string;
  location: string | null;
  meeting_link: string | null;
  interviewer_notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useInterviews(applicationId?: string) {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInterviews = async () => {
    if (!user) {
      setInterviews([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_org_interviews', {
        _user_id: user.id,
        _application_id: applicationId || null
      });

      if (error) throw error;
      setInterviews(data || []);
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [user, applicationId]);

  const createInterview = async (
    applicationId: string,
    scheduledAt: string,
    durationMinutes: number,
    interviewType: string,
    location?: string,
    meetingLink?: string
  ) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('create_org_interview', {
      _user_id: user.id,
      _application_id: applicationId,
      _scheduled_at: scheduledAt,
      _duration_minutes: durationMinutes,
      _interview_type: interviewType,
      _location: location || null,
      _meeting_link: meetingLink || null
    });

    if (error) throw error;
    await fetchInterviews();
    return data;
  };

  const updateInterview = async (
    interviewId: string,
    scheduledAt: string,
    durationMinutes: number,
    interviewType: string,
    status: string,
    location?: string,
    meetingLink?: string,
    interviewerNotes?: string
  ) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('update_org_interview', {
      _user_id: user.id,
      _interview_id: interviewId,
      _scheduled_at: scheduledAt,
      _duration_minutes: durationMinutes,
      _interview_type: interviewType,
      _location: location || null,
      _meeting_link: meetingLink || null,
      _status: status,
      _interviewer_notes: interviewerNotes || null
    });

    if (error) throw error;
    await fetchInterviews();
  };

  const deleteInterview = async (interviewId: string) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('delete_org_interview', {
      _user_id: user.id,
      _interview_id: interviewId
    });

    if (error) throw error;
    await fetchInterviews();
  };

  return { 
    interviews, 
    loading, 
    error, 
    createInterview, 
    updateInterview,
    deleteInterview,
    refetch: fetchInterviews 
  };
}
