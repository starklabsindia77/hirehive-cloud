import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendEmailDialogProps {
  candidateEmail: string;
  candidateName: string;
  jobTitle?: string;
}

export function SendEmailDialog({ candidateEmail, candidateName, jobTitle }: SendEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<string>('general');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const { toast } = useToast();

  const templateOptions = [
    { value: 'general', label: 'General Email' },
    { value: 'interview_invite', label: 'Interview Invitation' },
    { value: 'rejection', label: 'Rejection Notice' },
    { value: 'offer', label: 'Job Offer' },
  ];

  const templateDefaults: Record<string, { subject: string; content: string }> = {
    general: {
      subject: '',
      content: `Dear ${candidateName},\n\n\n\nBest regards,\nNexHire Team`
    },
    interview_invite: {
      subject: `Interview Invitation - ${jobTitle || 'Position'}`,
      content: `Dear ${candidateName},\n\nWe would like to invite you for an interview for the ${jobTitle || 'position'}.\n\nInterview Details:\n- Date: [Enter date]\n- Time: [Enter time]\n- Location/Link: [Enter location or meeting link]\n\nPlease confirm your attendance.\n\nBest regards,\nNexHire Team`
    },
    rejection: {
      subject: `Application Update - ${jobTitle || 'Position'}`,
      content: `Dear ${candidateName},\n\nThank you for your interest in the ${jobTitle || 'position'} at our organization.\n\nAfter careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.\n\nWe appreciate your time and wish you the best in your job search.\n\nBest regards,\nNexHire Team`
    },
    offer: {
      subject: `Job Offer - ${jobTitle || 'Position'}`,
      content: `Dear ${candidateName},\n\nWe are pleased to offer you the position of ${jobTitle || '[Position]'}!\n\nOffer Details:\n- Start Date: [Enter date]\n- Salary: [Enter salary]\n- Benefits: [Enter benefits]\n\nPlease review and respond by [Enter deadline].\n\nBest regards,\nNexHire Team`
    }
  };

  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    const defaults = templateDefaults[value];
    if (defaults) {
      setSubject(defaults.subject);
      setContent(defaults.content);
    }
  };

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
          template: template !== 'general' ? template : undefined,
          templateData: { jobTitle }
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
      setTemplate('general');
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
            <Label htmlFor="template">Email Template</Label>
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templateOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
