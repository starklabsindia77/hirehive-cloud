import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BulkEmailDialogProps {
  selectedIds: string[];
}

export function BulkEmailDialog({ selectedIds }: BulkEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [fromName, setFromName] = useState('');
  const { toast } = useToast();

  const handleSend = async () => {
    if (!subject || !content) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-bulk-email', {
        body: {
          candidateIds: selectedIds,
          subject,
          content,
          fromName: fromName || undefined,
        },
      });

      if (error) throw error;

      const successCount = data.results.filter((r: any) => r.success).length;
      const failCount = data.results.length - successCount;

      toast({
        title: 'Emails Sent',
        description: `Successfully sent ${successCount} email(s)${
          failCount > 0 ? `, ${failCount} failed` : ''
        }`,
      });

      setOpen(false);
      setSubject('');
      setContent('');
      setFromName('');
    } catch (error: any) {
      console.error('Bulk email error:', error);
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
        <Button disabled={selectedIds.length === 0} size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Send Email to Selected
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Bulk Email ({selectedIds.length} recipients)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="fromName">From Name (Optional)</Label>
            <Input
              id="fromName"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Your Company Name"
            />
          </div>
          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Use {{candidate_name}} to personalize"
              required
            />
          </div>
          <div>
            <Label htmlFor="content">Message *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Use {{candidate_name}} to personalize&#10;&#10;Dear {{candidate_name}},..."
              rows={10}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Emails
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
