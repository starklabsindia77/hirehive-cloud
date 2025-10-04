// This component handles creating notifications for new applications
// It's used by the public application submission
import { supabase } from '@/integrations/supabase/client';

export async function notifyNewApplication(
  orgSchema: string,
  candidateName: string,
  jobTitle: string,
  candidateId: string,
  jobId: string
) {
  try {
    // Get all team members from the organization
    const { data: orgData } = await supabase
      .from('organizations')
      .select('id')
      .eq('schema_name', orgSchema)
      .single();

    if (!orgData) return;

    const { data: teamMembers } = await supabase
      .from('profiles')
      .select('user_id, email, display_name')
      .eq('organization_id', orgData.id);

    if (!teamMembers || teamMembers.length === 0) return;

    // Create notifications for all team members
    for (const member of teamMembers) {
      await supabase.rpc('create_notification', {
        _user_id: member.user_id,
        _target_user_id: member.user_id,
        _title: 'New Application Received',
        _message: `${candidateName} applied for ${jobTitle}`,
        _type: 'new_application',
        _related_id: candidateId,
        _related_type: 'candidate'
      });

      // Send email notification
      if (member.email) {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            to: member.email,
            subject: 'New Application Received',
            message: `${candidateName} has applied for the ${jobTitle} position.`,
            actionUrl: `${window.location.origin}/candidates/${candidateId}`,
            actionText: 'View Application'
          }
        });
      }
    }
  } catch (error) {
    console.error('Error sending new application notifications:', error);
  }
}
