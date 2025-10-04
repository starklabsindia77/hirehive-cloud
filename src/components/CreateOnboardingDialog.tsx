import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, UserPlus } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useTeamMembers } from '@/hooks/useTeamMembers';

interface CreateOnboardingDialogProps {
  candidateId: string;
  candidateName: string;
}

interface Task {
  title: string;
  description: string;
  taskType: string;
  assignedTo?: string;
  dueDate?: string;
  isRequired: boolean;
  orderIndex: number;
}

interface Document {
  documentName: string;
  documentType: string;
  isRequired: boolean;
}

export function CreateOnboardingDialog({ candidateId, candidateName }: CreateOnboardingDialogProps) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [assignedBuddyId, setAssignedBuddyId] = useState('');
  const [assignedManagerId, setAssignedManagerId] = useState('');
  const [tasks, setTasks] = useState<Task[]>([
    { title: 'Complete HR paperwork', description: '', taskType: 'document', isRequired: true, orderIndex: 0 },
    { title: 'Setup workstation', description: '', taskType: 'equipment', isRequired: true, orderIndex: 1 },
    { title: 'Team introduction meeting', description: '', taskType: 'meeting', isRequired: true, orderIndex: 2 }
  ]);
  const [documents, setDocuments] = useState<Document[]>([
    { documentName: 'I-9 Form', documentType: 'tax', isRequired: true },
    { documentName: 'W-4 Form', documentType: 'tax', isRequired: true },
    { documentName: 'Direct Deposit Form', documentType: 'banking', isRequired: true }
  ]);

  const { createOnboarding } = useOnboarding();
  const { members: teamMembers } = useTeamMembers();

  const addTask = () => {
    setTasks([...tasks, {
      title: '',
      description: '',
      taskType: 'general',
      isRequired: false,
      orderIndex: tasks.length
    }]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: keyof Task, value: any) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: value };
    setTasks(updated);
  };

  const addDocument = () => {
    setDocuments([...documents, {
      documentName: '',
      documentType: 'other',
      isRequired: false
    }]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const updateDocument = (index: number, field: keyof Document, value: any) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], [field]: value };
    setDocuments(updated);
  };

  const handleSubmit = async () => {
    if (!startDate) return;

    await createOnboarding.mutateAsync({
      candidateId,
      startDate,
      assignedBuddyId: assignedBuddyId || undefined,
      assignedManagerId: assignedManagerId || undefined,
      tasks,
      documents
    });

    setOpen(false);
    // Reset form
    setStartDate('');
    setAssignedBuddyId('');
    setAssignedManagerId('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Start Onboarding
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start Onboarding Process for {candidateName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buddy">Assign Onboarding Buddy</Label>
              <Select value={assignedBuddyId} onValueChange={setAssignedBuddyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers?.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.display_name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager">Assign Manager</Label>
              <Select value={assignedManagerId} onValueChange={setAssignedManagerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers?.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.display_name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Onboarding Tasks</span>
                <Button variant="outline" size="sm" onClick={addTask}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasks.map((task, index) => (
                <Card key={index}>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <Input
                          placeholder="Task title *"
                          value={task.title}
                          onChange={(e) => updateTask(index, 'title', e.target.value)}
                        />
                        <Textarea
                          placeholder="Task description"
                          value={task.description}
                          onChange={(e) => updateTask(index, 'description', e.target.value)}
                        />
                        <div className="grid gap-3 md:grid-cols-3">
                          <Select
                            value={task.taskType}
                            onValueChange={(value) => updateTask(index, 'taskType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="document">Document</SelectItem>
                              <SelectItem value="training">Training</SelectItem>
                              <SelectItem value="meeting">Meeting</SelectItem>
                              <SelectItem value="equipment">Equipment</SelectItem>
                              <SelectItem value="access">Access</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="date"
                            placeholder="Due date"
                            value={task.dueDate || ''}
                            onChange={(e) => updateTask(index, 'dueDate', e.target.value)}
                          />
                          <Select
                            value={task.assignedTo || 'unassigned'}
                            onValueChange={(value) => updateTask(index, 'assignedTo', value === 'unassigned' ? undefined : value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Assign to" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {teamMembers?.map((member) => (
                                <SelectItem key={member.user_id} value={member.user_id}>
                                  {member.display_name || member.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={() => removeTask(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Required Documents</span>
                <Button variant="outline" size="sm" onClick={addDocument}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Document
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.map((doc, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <Input
                    placeholder="Document name *"
                    value={doc.documentName}
                    onChange={(e) => updateDocument(index, 'documentName', e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={doc.documentType}
                    onValueChange={(value) => updateDocument(index, 'documentType', value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tax">Tax Form</SelectItem>
                      <SelectItem value="banking">Banking</SelectItem>
                      <SelectItem value="identification">ID</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDocument(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!startDate || createOnboarding.isPending}
            >
              {createOnboarding.isPending ? 'Creating...' : 'Start Onboarding'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
