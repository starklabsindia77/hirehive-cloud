import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useOrganization } from '@/contexts/OrganizationContext';

interface SendEmailDialogProps {
  candidateEmail: string;
  candidateName: string;
  jobTitle?: string;
}

export function SendEmailDialog({ candidateEmail, candidateName, jobTitle }: SendEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templateId, setTemplateId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const { toast } = useToast();
  const { templates } = useEmailTemplates();
  const { organization } = useOrganization();

  const replaceVariables = (text: string) => {
    return text
      .replace(/\{\{candidateName\}\}/g, candidateName)
      .replace(/\{\{jobTitle\}\}/g, jobTitle || 'Position')
      .replace(/\{\{organizationName\}\}/g, organization?.brand_name || organization?.name || 'NexHire');
  };

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const selected = templates.find(t => t.id === templateId);
      if (selected) {
        setSubject(replaceVariables(selected.subject));
        setContent(replaceVariables(selected.content));
      }
    }
  }, [templateId, templates, candidateName, jobTitle, organization]);

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in subject and content',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-candidate-email', {
        body: {
          to: candidateEmail,
          candidateName,
          subject,
          content,
          templateData: { jobTitle, organizationName: organization?.brand_name || organization?.name }
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Email sent successfully',
      });
      
      setOpen(false);
      setSubject('');
      setContent('');
      setTemplateId('');
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send email',
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
          <Mail className="mr-2 h-4 w-4" />
          Send Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email to {candidateName}</DialogTitle>
          <DialogDescription>
            Compose and send an email to {candidateEmail}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template">Select Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Choose a template or start from scratch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Blank Template</SelectItem>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Email content"
              rows={12}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
