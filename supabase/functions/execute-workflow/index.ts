import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { workflowId, candidateId, applicationId, triggerData } = await req.json();

    console.log('Executing workflow:', workflowId, 'for candidate:', candidateId);

    // Get workflow and actions
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*, workflow_actions(*)')
      .eq('id', workflowId)
      .single();

    if (workflowError) throw workflowError;

    // Create execution log
    const { data: execution, error: execError } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id: workflowId,
        candidate_id: candidateId,
        application_id: applicationId,
        trigger_data: triggerData,
        status: 'running'
      })
      .select()
      .single();

    if (execError) throw execError;

    // Execute actions in order
    const sortedActions = workflow.workflow_actions.sort(
      (a: any, b: any) => a.order_index - b.order_index
    );

    for (const action of sortedActions) {
      // Apply delay if specified
      if (action.delay_minutes > 0) {
        await new Promise(resolve => setTimeout(resolve, action.delay_minutes * 60 * 1000));
      }

      try {
        await executeAction(action, candidateId, applicationId, supabase);
      } catch (actionError) {
        console.error('Error executing action:', action.id, actionError);
        // Continue with next action even if one fails
      }
    }

    // Update execution status
    await supabase
      .from('workflow_executions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', execution.id);

    return new Response(
      JSON.stringify({ success: true, executionId: execution.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error executing workflow:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function executeAction(action: any, candidateId: string, applicationId: string, supabase: any) {
  const config = action.action_config;

  switch (action.action_type) {
    case 'send_email':
      // Get candidate email
      const { data: candidate } = await supabase
        .from('candidates')
        .select('email, full_name')
        .eq('id', candidateId)
        .single();

      if (candidate) {
        await supabase.functions.invoke('send-candidate-email', {
          body: {
            to: candidate.email,
            subject: config.subject,
            content: config.content.replace('{{candidateName}}', candidate.full_name)
          }
        });
      }
      break;

    case 'update_stage':
      await supabase
        .from('candidates')
        .update({ stage: config.stage })
        .eq('id', candidateId);

      if (applicationId) {
        await supabase
          .from('applications')
          .update({ stage: config.stage })
          .eq('id', applicationId);
      }
      break;

    case 'webhook_call':
      // Call external webhook (Zapier, Make.com, etc.)
      await fetch(config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          applicationId,
          timestamp: new Date().toISOString(),
          action: 'workflow_triggered'
        })
      });
      break;

    case 'send_notification':
      // Create internal notification
      await supabase
        .from('notifications')
        .insert({
          user_id: config.userId,
          title: config.title || 'Workflow Action',
          message: config.message,
          type: 'workflow',
          related_id: candidateId
        });
      break;

    default:
      console.log('Unknown action type:', action.action_type);
  }
}
