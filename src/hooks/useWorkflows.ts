import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'inactive' | 'draft';
  trigger_type: string;
  trigger_config: any;
  created_by: string;
  created_at: string;
  updated_at: string;
  action_count: number;
}

export interface WorkflowAction {
  id: string;
  workflow_id: string;
  action_type: string;
  action_config: any;
  order_index: number;
  delay_minutes: number;
  created_at: string;
}

export function useWorkflows() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_org_workflows', {
        _user_id: user.id
      });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [user]);

  const createWorkflow = async (
    name: string,
    description: string,
    triggerType: 'candidate_created' | 'application_submitted' | 'stage_changed' | 'time_based' | 'candidate_inactive' | 'score_threshold' | 'webhook_received',
    triggerConfig: any = {}
  ) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('create_workflow', {
      _user_id: user.id,
      _name: name,
      _description: description,
      _trigger_type: triggerType,
      _trigger_config: triggerConfig
    });

    if (error) throw error;
    await fetchWorkflows();
    return data;
  };

  const updateWorkflowStatus = async (workflowId: string, status: 'active' | 'inactive' | 'draft') => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.rpc('update_workflow_status', {
      _user_id: user.id,
      _workflow_id: workflowId,
      _status: status
    });

    if (error) throw error;
    await fetchWorkflows();
  };

  return {
    workflows,
    loading,
    createWorkflow,
    updateWorkflowStatus,
    refetch: fetchWorkflows
  };
}

export function useWorkflowActions(workflowId: string | null) {
  const { user } = useAuth();
  const [actions, setActions] = useState<WorkflowAction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActions = async () => {
    if (!user || !workflowId) {
      setActions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_workflow_actions', {
        _user_id: user.id,
        _workflow_id: workflowId
      });

      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error('Error fetching workflow actions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [user, workflowId]);

  const addAction = async (
    actionType: 'send_email' | 'update_stage' | 'assign_to_user' | 'add_tag' | 'webhook_call' | 'create_task' | 'send_notification',
    actionConfig: any,
    orderIndex: number = 0,
    delayMinutes: number = 0
  ) => {
    if (!user || !workflowId) throw new Error('User not authenticated or no workflow selected');

    const { data, error } = await supabase.rpc('add_workflow_action', {
      _user_id: user.id,
      _workflow_id: workflowId,
      _action_type: actionType,
      _action_config: actionConfig,
      _order_index: orderIndex,
      _delay_minutes: delayMinutes
    });

    if (error) throw error;
    await fetchActions();
    return data;
  };

  return {
    actions,
    loading,
    addAction,
    refetch: fetchActions
  };
}
