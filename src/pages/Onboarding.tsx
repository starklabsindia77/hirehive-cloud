import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useOnboarding, useOnboardingTasks, useOnboardingDocuments } from '@/hooks/useOnboarding';
import { useCandidates } from '@/hooks/useCandidates';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { format } from 'date-fns';
import { Calendar, CheckCircle2, Clock, FileText, Users } from 'lucide-react';
import { useState } from 'react';

export default function Onboarding() {
  const [selectedOnboarding, setSelectedOnboarding] = useState<string | null>(null);
  const { processes, loadingProcesses, updateTaskStatus } = useOnboarding();
  const { candidates } = useCandidates();
  const { members: teamMembers } = useTeamMembers();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'on_hold': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCandidate = (candidateId: string) => {
    return candidates?.find(c => c.id === candidateId);
  };

  const getTeamMember = (userId: string | null) => {
    if (!userId) return null;
    return teamMembers?.find(m => m.user_id === userId);
  };

  if (loadingProcesses) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading onboarding processes...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Onboarding</h1>
          <p className="text-muted-foreground mt-2">
            Manage new hire onboarding processes and track progress
          </p>
        </div>

        {!processes || processes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Onboarding Processes</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start onboarding processes from the candidate detail page
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {processes.map((process) => {
              const candidate = getCandidate(process.candidate_id);
              const buddy = getTeamMember(process.assigned_buddy_id);
              const manager = getTeamMember(process.assigned_manager_id);

              return (
                <Card
                  key={process.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedOnboarding(process.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {candidate?.full_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {candidate?.current_position}
                        </p>
                      </div>
                      <Badge className={getStatusColor(process.status)}>
                        {process.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{process.progress_percentage}%</span>
                      </div>
                      <Progress value={process.progress_percentage} />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Start:</span>
                        <span>{format(new Date(process.start_date), 'MMM d, yyyy')}</span>
                      </div>
                      {process.expected_end_date && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Expected End:</span>
                          <span>{format(new Date(process.expected_end_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      {buddy && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Buddy:</span>
                          <span>{buddy.display_name || buddy.email}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {selectedOnboarding && (
          <OnboardingDetails
            onboardingId={selectedOnboarding}
            onClose={() => setSelectedOnboarding(null)}
            updateTaskStatus={updateTaskStatus}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function OnboardingDetails({
  onboardingId,
  onClose,
  updateTaskStatus
}: {
  onboardingId: string;
  onClose: () => void;
  updateTaskStatus: any;
}) {
  const { data: tasks } = useOnboardingTasks(onboardingId);
  const { data: documents } = useOnboardingDocuments(onboardingId);

  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await updateTaskStatus.mutateAsync({ taskId, status: newStatus });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Onboarding Details</CardTitle>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tasks">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4 mt-4">
            {tasks?.map((task) => (
              <Card key={task.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={() => handleTaskToggle(task.id, task.status)}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                            {task.is_required && <span className="text-destructive ml-1">*</span>}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          )}
                        </div>
                        <Badge variant="outline">{task.task_type}</Badge>
                      </div>
                      {task.due_date && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </div>
                      )}
                      {task.completed_at && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed: {format(new Date(task.completed_at), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-4">
            {documents?.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">
                          {doc.document_name}
                          {doc.is_required && <span className="text-destructive ml-1">*</span>}
                        </h4>
                        <p className="text-sm text-muted-foreground">{doc.document_type}</p>
                      </div>
                    </div>
                    <Badge
                      className={
                        doc.status === 'approved'
                          ? 'bg-green-500'
                          : doc.status === 'submitted'
                          ? 'bg-blue-500'
                          : doc.status === 'rejected'
                          ? 'bg-red-500'
                          : 'bg-gray-500'
                      }
                    >
                      {doc.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
