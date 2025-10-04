import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TeamMember {
  user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  roles: string[];
  created_at: string;
}

export function useTeamMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeamMembers = async () => {
    if (!user) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_org_team_members', {
        _user_id: user.id
      });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [user]);

  const assignRole = async (targetUserId: string, role: string) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('assign_user_role', {
      _assigner_id: user.id,
      _target_user_id: targetUserId,
      _role: role as any
    });

    if (error) throw error;
    await fetchTeamMembers();
  };

  const removeRole = async (targetUserId: string, role: string) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('remove_user_role', {
      _remover_id: user.id,
      _target_user_id: targetUserId,
      _role: role as any
    });

    if (error) throw error;
    await fetchTeamMembers();
  };

  const removeMember = async (targetUserId: string) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('remove_org_member', {
      _remover_id: user.id,
      _target_user_id: targetUserId
    });

    if (error) throw error;
    await fetchTeamMembers();
  };

  return { 
    members, 
    loading, 
    error, 
    refetch: fetchTeamMembers,
    assignRole,
    removeRole,
    removeMember
  };
}
