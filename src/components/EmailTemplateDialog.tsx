import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmailTemplate } from '@/hooks/useEmailTemplates';

interface EmailTemplateDialogProps {
  template?: EmailTemplate;
  onSave: (
    name: string,
    subject: string,
    content: string,
    templateType: string,
    variables: string[]
  ) => Promise<void>;
  trigger?: React.ReactNode;
}

export function EmailTemplateDialog({ template, onSave, trigger }: EmailTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [templateType, setTemplateType] = useState('general');
  const [variablesText, setVariablesText] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      setContent(template.content);
      setTemplateType(template.template_type);
      setVariablesText(template.variables?.join(', ') || '');
    }
  }, [template]);

  const handleSave = async () => {
    if (!name.trim() || !subject.trim() || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const variables = variablesText
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);

      await onSave(name, subject, content, templateType, variables);

      toast({
        title: 'Success',
        description: template ? 'Template updated successfully' : 'Template created successfully',
      });
      
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (!template) {
      setName('');
      setSubject('');
      setContent('');
      setTemplateType('general');
      setVariablesText('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Email Template' : 'Create Email Template'}</DialogTitle>
          <DialogDescription>
            Create reusable email templates with variables for dynamic content.
            Use {"{{variable}}"} syntax in subject and content.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Interview Invitation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="templateType">Template Type</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger id="templateType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="interview_invite">Interview Invitation</SelectItem>
                <SelectItem value="rejection">Rejection</SelectItem>
                <SelectItem value="offer">Job Offer</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Interview Invitation - {{jobTitle}}"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Email Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Dear {{candidateName}},&#10;&#10;We are pleased to invite you...&#10;&#10;Best regards,&#10;{{organizationName}}"
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="variables">Available Variables (comma-separated)</Label>
            <Input
              id="variables"
              value={variablesText}
              onChange={(e) => setVariablesText(e.target.value)}
              placeholder="candidateName, jobTitle, organizationName, interviewDate"
            />
            <p className="text-xs text-muted-foreground">
              Use these as {"{{variableName}}"} in your subject and content
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {template ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
