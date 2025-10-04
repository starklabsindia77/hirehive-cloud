import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StageSelectProps {
  applicationId: string;
  currentStage: string;
  candidateEmail?: string;
  candidateName?: string;
  jobTitle?: string;
  onStageChange?: () => void;
}

const stages = [
  { value: 'screening', label: 'Screening' },
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

export function StageSelect({ applicationId, currentStage, candidateEmail, candidateName, jobTitle, onStageChange }: StageSelectProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleStageChange = async (newStage: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('update_org_application_stage', {
        _user_id: user.id,
        _application_id: applicationId,
        _new_stage: newStage
      });

      if (error) throw error;

      // Get application details for notifications
      const { data: applicationData } = await supabase.rpc('get_org_applications', {
        _user_id: user.id,
      });
      const application = applicationData?.find((app: any) => app.id === applicationId);

      // Log activity
      await supabase.rpc('log_org_activity', {
        _user_id: user.id,
        _activity_type: 'stage_change',
        _description: `Stage changed to ${stages.find(s => s.value === newStage)?.label || newStage}`,
        _candidate_id: application?.candidate_id,
        _job_id: null,
        _metadata: { application_id: applicationId, new_stage: newStage, old_stage: currentStage }
      });

      // Create notification for assigned user if candidate is assigned
      if (application?.candidate_id) {
        const { data: candidateData } = await supabase.rpc('get_org_candidate', {
          _user_id: user.id,
          _candidate_id: application.candidate_id
        });
        const candidate = candidateData?.[0];

        if (candidate?.assigned_to && candidate.assigned_to !== user.id) {
          const userProfile = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', user.id)
            .single();

          await supabase.rpc('create_notification', {
            _user_id: user.id,
            _target_user_id: candidate.assigned_to,
            _title: 'Candidate Stage Updated',
            _message: `${userProfile.data?.display_name || 'Someone'} moved ${candidate.full_name} to ${stages.find(s => s.value === newStage)?.label || newStage}`,
            _type: 'stage_change',
            _related_id: candidate.id,
            _related_type: 'candidate'
          });

          // Send email notification for stage change
          const assignedProfile = await supabase
            .from('profiles')
            .select('email')
            .eq('user_id', candidate.assigned_to)
            .single();

          if (assignedProfile.data?.email) {
            await supabase.functions.invoke('send-notification-email', {
              body: {
                to: assignedProfile.data.email,
                subject: 'Candidate Stage Updated',
                message: `${candidate.full_name} has been moved to ${stages.find(s => s.value === newStage)?.label || newStage} stage.`,
                actionUrl: `${window.location.origin}/candidates/${candidate.id}`,
                actionText: 'View Candidate'
              }
            });
          }
        }
      }

      // Send notification email for certain stage changes
      if (candidateEmail && candidateName && (newStage === 'offer' || newStage === 'rejected')) {
        try {
          const template = newStage === 'offer' ? 'offer' : 'rejection';
          const subject = newStage === 'offer' 
            ? `Job Offer - ${jobTitle || 'Position'}` 
            : `Application Update - ${jobTitle || 'Position'}`;

          await supabase.functions.invoke('send-candidate-email', {
            body: {
              to: candidateEmail,
              candidateName,
              subject,
              template,
              templateData: {
                jobTitle: jobTitle || 'Position',
                organizationName: 'NexHire'
              }
            }
          });
        } catch (emailError) {
          console.error('Error sending notification email:', emailError);
        }
      }

      toast({
        title: 'Success',
        description: 'Stage updated successfully',
      });

      if (onStageChange) onStageChange();
    } catch (error) {
      console.error('Error updating stage:', error);
      toast({
        title: 'Error',
        description: 'Failed to update stage',
        variant: 'destructive',
      });
    }
  };

  return (
    <Select value={currentStage} onValueChange={handleStageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {stages.map((stage) => (
          <SelectItem key={stage.value} value={stage.value}>
            {stage.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
