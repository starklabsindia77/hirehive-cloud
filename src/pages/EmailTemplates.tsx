import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Mail, Edit, Trash2, Loader2 } from 'lucide-react';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { EmailTemplateDialog } from '@/components/EmailTemplateDialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function EmailTemplates() {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate, refetch } = useEmailTemplates();
  const { toast } = useToast();
  const [deletingTemplate, setDeletingTemplate] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreate = async (
    name: string,
    subject: string,
    content: string,
    templateType: string,
    variables: string[]
  ) => {
    await createTemplate(name, subject, content, templateType, variables);
  };

  const handleUpdate = async (
    name: string,
    subject: string,
    content: string,
    templateType: string,
    variables: string[]
  ) => {
    if (!editingTemplate) return;
    await updateTemplate(editingTemplate.id, name, subject, content, templateType, variables);
    setEditingTemplate(null);
  };

  const handleDelete = async (templateId: string) => {
    setActionLoading(true);
    try {
      await deleteTemplate(templateId);
      toast({
        title: 'Template Deleted',
        description: 'Email template has been deleted successfully',
      });
      setDeletingTemplate(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete template',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      interview_invite: 'bg-blue-500',
      rejection: 'bg-red-500',
      offer: 'bg-green-500',
      follow_up: 'bg-yellow-500',
      general: 'bg-gray-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Email Templates</h1>
            <p className="text-muted-foreground">
              Create and manage reusable email templates for your recruitment process
            </p>
          </div>
          <EmailTemplateDialog onSave={handleCreate} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Your Templates ({templates.length})
            </CardTitle>
            <CardDescription>
              Manage email templates with dynamic variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Email Templates</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first email template to streamline your communication
                </p>
                <EmailTemplateDialog onSave={handleCreate} />
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            <Badge className={`${getTypeBadgeColor(template.template_type)} text-white`}>
                              {template.template_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            <strong>Subject:</strong> {template.subject}
                          </p>
                          <div className="bg-muted p-3 rounded-lg mb-3">
                            <p className="text-sm whitespace-pre-wrap line-clamp-3">
                              {template.content}
                            </p>
                          </div>
                          {template.variables && template.variables.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              <span className="text-sm text-muted-foreground">Variables:</span>
                              {template.variables.map((variable) => (
                                <Badge key={variable} variant="outline">
                                  {`{{${variable}}}`}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <EmailTemplateDialog
                            template={template}
                            onSave={handleUpdate}
                            trigger={
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deletingTemplate} onOpenChange={(open) => !open && setDeletingTemplate(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Email Template</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this email template? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingTemplate && handleDelete(deletingTemplate)}
                disabled={actionLoading}
                className="bg-destructive hover:bg-destructive/90"
              >
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Template
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
