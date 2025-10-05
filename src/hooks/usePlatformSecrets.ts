import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlatformSecret {
  id: string;
  key_name: string;
  key_value: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePlatformSecrets = () => {
  const queryClient = useQueryClient();

  const { data: secrets, isLoading } = useQuery({
    queryKey: ['platform-secrets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_secrets')
        .select('*')
        .order('key_name');
      
      if (error) throw error;
      return data as PlatformSecret[];
    }
  });

  const updateSecret = useMutation({
    mutationFn: async ({
      keyName,
      keyValue,
      description,
      isActive = true
    }: {
      keyName: string;
      keyValue: string;
      description?: string;
      isActive?: boolean;
    }) => {
      const { data, error } = await supabase.rpc('set_platform_secret', {
        _key_name: keyName,
        _key_value: keyValue,
        _description: description
      });

      if (error) throw error;

      // Update active status if provided
      if (data) {
        const { error: updateError } = await supabase
          .from('platform_secrets')
          .update({ is_active: isActive })
          .eq('id', data);
        
        if (updateError) throw updateError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-secrets'] });
      toast.success('Secret updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update secret');
    }
  });

  const deleteSecret = useMutation({
    mutationFn: async (secretId: string) => {
      const { error } = await supabase
        .from('platform_secrets')
        .delete()
        .eq('id', secretId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-secrets'] });
      toast.success('Secret deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete secret');
    }
  });

  const toggleSecretStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('platform_secrets')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-secrets'] });
      toast.success('Secret status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update secret status');
    }
  });

  return {
    secrets,
    isLoading,
    updateSecret,
    deleteSecret,
    toggleSecretStatus
  };
};
