import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useWorkflows } from '@/hooks/useWorkflows';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateWorkflowDialog } from '@/components/CreateWorkflowDialog';
import { Plus, Play, Pause, Zap, Clock, Mail, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Workflows() {
  const { workflows, loading, updateWorkflowStatus } = useWorkflows();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleToggleStatus = async (workflowId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateWorkflowStatus(workflowId, newStatus);
      toast({
        title: 'Workflow updated',
        description: `Workflow is now ${newStatus}`
      });
    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to update workflow status',
        variant: 'destructive'
      });
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'time_based':
      case 'candidate_inactive':
        return <Clock className="h-4 w-4" />;
      case 'stage_changed':
        return <UserPlus className="h-4 w-4" />;
      case 'application_submitted':
      case 'candidate_created':
        return <Zap className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = (triggerType: string) => {
    return triggerType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Workflow Automation</h1>
            <p className="text-muted-foreground mt-1">
              Automate your recruitment process with custom workflows
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : workflows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first workflow to automate candidate management
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTriggerIcon(workflow.trigger_type)}
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    </div>
                    <Badge
                      variant={
                        workflow.status === 'active'
                          ? 'default'
                          : workflow.status === 'inactive'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {workflow.status}
                    </Badge>
                  </div>
                  <CardDescription>{workflow.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Trigger:</span>
                    <Badge variant="outline">
                      {getTriggerLabel(workflow.trigger_type)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Actions:</span>
                    <span className="font-medium">{workflow.action_count}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={workflow.status === 'active' ? 'outline' : 'default'}
                      className="flex-1"
                      onClick={() => handleToggleStatus(workflow.id, workflow.status)}
                    >
                      {workflow.status === 'active' ? (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <CreateWorkflowDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen} 
        />
      </div>
    </DashboardLayout>
  );
}
