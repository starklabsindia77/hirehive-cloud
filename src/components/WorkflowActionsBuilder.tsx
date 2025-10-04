import { useState } from 'react';
import { useWorkflowActions } from '@/hooks/useWorkflows';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Mail, UserPlus, Tag, Bell, ExternalLink, Clock } from 'lucide-react';

interface WorkflowActionsBuilderProps {
  workflowId: string | null;
}

export function WorkflowActionsBuilder({ workflowId }: WorkflowActionsBuilderProps) {
  const { actions, addAction, loading } = useWorkflowActions(workflowId);
  const [actionType, setActionType] = useState('');
  const [actionConfig, setActionConfig] = useState<any>({});
  const [delayMinutes, setDelayMinutes] = useState(0);
  const { toast } = useToast();

  const handleAddAction = async () => {
    if (!actionType) {
      toast({
        title: 'Missing action type',
        description: 'Please select an action type',
        variant: 'destructive'
      });
      return;
    }

    try {
      await addAction(actionType as any, actionConfig, actions.length, delayMinutes);
      setActionType('');
      setActionConfig({});
      setDelayMinutes(0);
      toast({
        title: 'Action added',
        description: 'Action has been added to the workflow'
      });
    } catch (error) {
      console.error('Error adding action:', error);
      toast({
        title: 'Error',
        description: 'Failed to add action',
        variant: 'destructive'
      });
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_email':
        return <Mail className="h-4 w-4" />;
      case 'update_stage':
        return <UserPlus className="h-4 w-4" />;
      case 'add_tag':
        return <Tag className="h-4 w-4" />;
      case 'send_notification':
        return <Bell className="h-4 w-4" />;
      case 'webhook_call':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const renderActionConfigForm = () => {
    switch (actionType) {
      case 'send_email':
        return (
          <>
            <div className="space-y-2">
              <Label>Email Subject</Label>
              <Input
                value={actionConfig.subject || ''}
                onChange={(e) => setActionConfig({ ...actionConfig, subject: e.target.value })}
                placeholder="Email subject"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Content</Label>
              <Textarea
                value={actionConfig.content || ''}
                onChange={(e) => setActionConfig({ ...actionConfig, content: e.target.value })}
                placeholder="Email content"
                rows={4}
              />
            </div>
          </>
        );
      case 'update_stage':
        return (
          <div className="space-y-2">
            <Label>New Stage</Label>
            <Select
              value={actionConfig.stage || ''}
              onValueChange={(value) => setActionConfig({ ...actionConfig, stage: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case 'webhook_call':
        return (
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input
              value={actionConfig.url || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, url: e.target.value })}
              placeholder="https://zapier.com/hooks/..."
              type="url"
            />
          </div>
        );
      case 'add_tag':
        return (
          <div className="space-y-2">
            <Label>Tag Name</Label>
            <Input
              value={actionConfig.tag || ''}
              onChange={(e) => setActionConfig({ ...actionConfig, tag: e.target.value })}
              placeholder="e.g., auto-rejected"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="font-semibold">Actions ({actions.length})</h3>
        
        {actions.map((action, index) => (
          <Card key={action.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {getActionIcon(action.action_type)}
                <CardTitle className="text-sm">
                  Step {index + 1}: {action.action_type.replace(/_/g, ' ')}
                </CardTitle>
              </div>
              {action.delay_minutes > 0 && (
                <CardDescription className="text-xs">
                  Delay: {action.delay_minutes} minutes
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add New Action</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Action Type</Label>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send_email">Send Email</SelectItem>
                <SelectItem value="update_stage">Update Stage</SelectItem>
                <SelectItem value="add_tag">Add Tag</SelectItem>
                <SelectItem value="send_notification">Send Notification</SelectItem>
                <SelectItem value="webhook_call">Call Webhook (Zapier/Make)</SelectItem>
                <SelectItem value="assign_to_user">Assign to User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {actionType && renderActionConfigForm()}

          <div className="space-y-2">
            <Label>Delay (minutes)</Label>
            <Input
              type="number"
              min="0"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <Button onClick={handleAddAction} className="w-full" disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Action
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
