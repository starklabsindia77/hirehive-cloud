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
