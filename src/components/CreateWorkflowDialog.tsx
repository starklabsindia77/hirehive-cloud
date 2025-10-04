import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useToast } from '@/hooks/use-toast';
import { WorkflowActionsBuilder } from './WorkflowActionsBuilder';

interface CreateWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkflowDialog({ open, onOpenChange }: CreateWorkflowDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('');
  const [step, setStep] = useState<'basic' | 'actions'>('basic');
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { createWorkflow } = useWorkflows();
  const { toast } = useToast();

  const handleCreateWorkflow = async () => {
    if (!name || !triggerType) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const id = await createWorkflow(name, description, triggerType as any, {});
      setWorkflowId(id);
      setStep('actions');
      toast({
        title: 'Workflow created',
        description: 'Now add actions to your workflow'
      });
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to create workflow',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setTriggerType('');
    setStep('basic');
    setWorkflowId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'basic' ? 'Create Workflow' : 'Add Actions'}
          </DialogTitle>
          <DialogDescription>
            {step === 'basic'
              ? 'Set up your workflow trigger'
              : 'Define what happens when this workflow is triggered'}
          </DialogDescription>
        </DialogHeader>

        {step === 'basic' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workflow Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Auto-reject after 30 days"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this workflow do?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger">Trigger *</Label>
              <Select value={triggerType} onValueChange={setTriggerType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate_created">When candidate is created</SelectItem>
                  <SelectItem value="application_submitted">When application is submitted</SelectItem>
                  <SelectItem value="stage_changed">When stage changes</SelectItem>
                  <SelectItem value="candidate_inactive">When candidate is inactive</SelectItem>
                  <SelectItem value="time_based">Time-based (scheduled)</SelectItem>
                  <SelectItem value="score_threshold">When score meets threshold</SelectItem>
                  <SelectItem value="webhook_received">When webhook is received</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkflow} disabled={loading}>
                {loading ? 'Creating...' : 'Next: Add Actions'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <WorkflowActionsBuilder workflowId={workflowId} />
            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
