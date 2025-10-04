import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlatformSettings {
  id: string;
  platform_name: string;
  platform_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  favicon_url: string | null;
  login_page_title: string | null;
  login_page_subtitle: string | null;
  custom_css: string | null;
  custom_header_code: string | null;
  custom_footer_code: string | null;
  updated_at: string;
}

export const usePlatformSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_platform_settings');
      if (error) throw error;
      return data?.[0] as PlatformSettings;
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<PlatformSettings>) => {
      const { data: current } = await supabase.rpc('get_platform_settings');
      const settingsId = current?.[0]?.id;

      if (!settingsId) throw new Error('Platform settings not found');

      const { error } = await supabase
        .from('platform_settings')
        .update({
          ...updates,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', settingsId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      toast.success('Platform settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update platform settings');
    }
  });

  return {
    settings,
    isLoading,
    updateSettings
  };
};
