import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInterviews } from '@/hooks/useInterviews';
import { supabase } from '@/integrations/supabase/client';

interface ScheduleInterviewDialogProps {
  applicationId: string;
  candidateName: string;
  candidateEmail?: string;
  jobTitle?: string;
  onSuccess?: () => void;
}

export function ScheduleInterviewDialog({ applicationId, candidateName, candidateEmail, jobTitle, onSuccess }: ScheduleInterviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { createInterview } = useInterviews();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: '60',
    type: 'phone',
    location: '',
    meetingLink: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const scheduledAt = `${formData.date}T${formData.time}:00`;
      await createInterview(
        applicationId,
        scheduledAt,
        parseInt(formData.duration),
        formData.type,
        formData.location || undefined,
        formData.meetingLink || undefined
      );

      // Send interview invitation email if candidate email is provided
      if (candidateEmail) {
        try {
          const interviewDate = new Date(scheduledAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          const interviewTime = new Date(scheduledAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });

          await supabase.functions.invoke('send-candidate-email', {
            body: {
              to: candidateEmail,
              candidateName,
              subject: `Interview Invitation for ${jobTitle || 'Position'}`,
              template: 'interview_invite',
              templateData: {
                jobTitle: jobTitle || 'Position',
                interviewDate,
                interviewTime,
                duration: `${formData.duration} minutes`,
                interviewType: formData.type,
                location: formData.location || '',
                meetingLink: formData.meetingLink || '',
                organizationName: 'NexHire'
              }
            }
          });

          toast({
            title: 'Success',
            description: `Interview scheduled and invitation sent to ${candidateName}`,
          });
        } catch (emailError) {
          console.error('Error sending interview email:', emailError);
          toast({
            title: 'Interview Scheduled',
            description: `Interview scheduled with ${candidateName} but email notification failed to send`,
          });
        }
      } else {
        toast({
          title: 'Success',
          description: `Interview scheduled with ${candidateName}`,
        });
      }

      setOpen(false);
      setFormData({
        date: '',
        time: '',
        duration: '60',
        type: 'phone',
        location: '',
        meetingLink: ''
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule interview',
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
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Interview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Schedule an interview with {candidateName}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData({ ...formData, duration: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Interview Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Screen</SelectItem>
                  <SelectItem value="video">Video Interview</SelectItem>
                  <SelectItem value="onsite">On-site Interview</SelectItem>
                  <SelectItem value="technical">Technical Interview</SelectItem>
                  <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'onsite' && (
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter interview location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            )}

            {(formData.type === 'video' || formData.type === 'phone') && (
              <div className="grid gap-2">
                <Label htmlFor="meetingLink">Meeting Link</Label>
                <Input
                  id="meetingLink"
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
