import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface OnboardingProcess {
  id: string;
  candidate_id: string;
  template_id: string | null;
  start_date: string;
  expected_end_date: string | null;
  actual_end_date: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  progress_percentage: number;
  assigned_buddy_id: string | null;
  assigned_manager_id: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingTask {
  id: string;
  onboarding_id: string;
  title: string;
  description: string | null;
  task_type: 'document' | 'training' | 'meeting' | 'equipment' | 'access' | 'general';
  assigned_to: string | null;
  due_date: string | null;
  completed_at: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  order_index: number;
  is_required: boolean;
}

export interface OnboardingDocument {
  id: string;
  onboarding_id: string;
  document_name: string;
  document_type: string;
  file_url: string | null;
  is_required: boolean;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
}

export const useOnboarding = (candidateId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: processes, isLoading: loadingProcesses } = useQuery({
    queryKey: ['onboarding-processes', candidateId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('get_onboarding_processes', {
        _user_id: user.id,
        _candidate_id: candidateId || null
      });

      if (error) throw error;
      return data as OnboardingProcess[];
    },
    enabled: !!user
  });

  const createOnboarding = useMutation({
    mutationFn: async (params: {
      candidateId: string;
      startDate: string;
      assignedBuddyId?: string;
      assignedManagerId?: string;
      tasks: Array<{
        title: string;
        description?: string;
        taskType: string;
        assignedTo?: string;
        dueDate?: string;
        isRequired: boolean;
        orderIndex: number;
      }>;
      documents: Array<{
        documentName: string;
        documentType: string;
        isRequired: boolean;
      }>;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Create onboarding process
      const { data: onboardingId, error: processError } = await supabase.rpc(
        'create_onboarding_process',
        {
          _user_id: user.id,
          _candidate_id: params.candidateId,
          _template_id: null,
          _start_date: params.startDate,
          _assigned_buddy_id: params.assignedBuddyId || null,
          _assigned_manager_id: params.assignedManagerId || null
        }
      );

      if (processError) throw processError;

      return onboardingId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-processes'] });
      toast({
        title: 'Success',
        description: 'Onboarding process created successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateTaskStatus = useMutation({
    mutationFn: async (params: { taskId: string; status: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('update_task_status', {
        _user_id: user.id,
        _task_id: params.taskId,
        _new_status: params.status
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-processes'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-tasks'] });
      toast({
        title: 'Success',
        description: 'Task status updated'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    processes,
    loadingProcesses,
    createOnboarding,
    updateTaskStatus
  };
};

export const useOnboardingTasks = (onboardingId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['onboarding-tasks', onboardingId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('get_onboarding_tasks', {
        _user_id: user.id,
        _onboarding_id: onboardingId
      });

      if (error) throw error;
      return data as OnboardingTask[];
    },
    enabled: !!user && !!onboardingId
  });
};

export const useOnboardingDocuments = (onboardingId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['onboarding-documents', onboardingId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('get_onboarding_documents', {
        _user_id: user.id,
        _onboarding_id: onboardingId
      });

      if (error) throw error;
      return data as OnboardingDocument[];
    },
    enabled: !!user && !!onboardingId
  });
};
