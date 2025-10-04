import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMembers } from '@/hooks/useTeamMembers';

interface AssignCandidateDialogProps {
  candidateId: string;
  currentAssignee?: string | null;
  onSuccess?: () => void;
}

export function AssignCandidateDialog({
  candidateId,
  currentAssignee,
  onSuccess,
}: AssignCandidateDialogProps) {
  const [open, setOpen] = useState(false);
  const [assignedTo, setAssignedTo] = useState(currentAssignee || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { members: teamMembers } = useTeamMembers();

  const handleAssign = async () => {
    if (!user || !assignedTo) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('assign_candidate', {
        _user_id: user.id,
        _candidate_id: candidateId,
        _assigned_to: assignedTo,
      });

      if (error) throw error;

      // Log activity
      await supabase.rpc('log_org_activity', {
        _user_id: user.id,
        _activity_type: 'candidate_assigned',
        _description: `Candidate assigned to team member`,
        _candidate_id: candidateId,
        _job_id: null,
        _metadata: { assigned_to: assignedTo }
      });

      toast({
        title: 'Success',
        description: 'Candidate assigned successfully',
      });

      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error assigning candidate:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          {currentAssignee ? 'Reassign' : 'Assign'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Candidate</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign To</label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    {member.display_name || member.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={loading || !assignedTo}>
              Assign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
