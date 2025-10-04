import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInterviews } from '@/hooks/useInterviews';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InterviewPanelSchedulerProps {
  applicationId: string;
  candidateName: string;
  candidateEmail?: string;
  jobTitle?: string;
  onSuccess?: () => void;
}

interface PanelMember {
  userId: string;
  name: string;
  available: boolean | null;
}

export function InterviewPanelScheduler({ 
  applicationId, 
  candidateName, 
  candidateEmail,
  jobTitle,
  onSuccess 
}: InterviewPanelSchedulerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const { createInterview } = useInterviews();
  const { members: teamMembers } = useTeamMembers();
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: '60',
    type: 'panel',
    location: '',
    meetingLink: ''
  });

  const [panelMembers, setPanelMembers] = useState<PanelMember[]>([]);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  const togglePanelMember = (userId: string, name: string) => {
    setPanelMembers(prev => {
      const exists = prev.find(m => m.userId === userId);
      if (exists) {
        return prev.filter(m => m.userId !== userId);
      }
      return [...prev, { userId, name, available: null }];
    });
    setAvailabilityChecked(false);
  };

  const checkAvailability = async () => {
    if (!formData.date || !formData.time || panelMembers.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select date, time, and panel members",
        variant: "destructive"
      });
      return;
    }

    setCheckingAvailability(true);
    try {
      const scheduledAt = new Date(`${formData.date}T${formData.time}:00`);
      const endTime = new Date(scheduledAt.getTime() + parseInt(formData.duration) * 60000);

      // Check for conflicts with existing interviews
      const { data: allInterviews } = await supabase.rpc('get_org_interviews', {
        _user_id: user!.id
      });

      const updatedMembers = panelMembers.map(member => {
        const hasConflict = allInterviews?.some((interview: any) => {
          const interviewStart = new Date(interview.scheduled_at);
          const interviewEnd = new Date(interviewStart.getTime() + interview.duration_minutes * 60000);
          
          // Check if this interview involves this panel member
          const involvesThisMember = interview.interviewer_notes?.includes(member.userId);
          
          // Check for time overlap
          return involvesThisMember && (
            (scheduledAt >= interviewStart && scheduledAt < interviewEnd) ||
            (endTime > interviewStart && endTime <= interviewEnd) ||
            (scheduledAt <= interviewStart && endTime >= interviewEnd)
          );
        });

        return { ...member, available: !hasConflict };
      });

      setPanelMembers(updatedMembers);
      setAvailabilityChecked(true);

      const availableCount = updatedMembers.filter(m => m.available).length;
      const unavailableCount = updatedMembers.filter(m => !m.available).length;

      if (unavailableCount > 0) {
        toast({
          title: "Availability Check Complete",
          description: `${availableCount} available, ${unavailableCount} unavailable`,
        });
      } else {
        toast({
          title: "All Panel Members Available",
          description: "You can proceed with scheduling",
        });
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast({
        title: "Error",
        description: "Failed to check availability",
        variant: "destructive"
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (panelMembers.length === 0) {
      toast({
        title: "No Panel Members",
        description: "Please select at least one panel member",
        variant: "destructive"
      });
      return;
    }

    if (!availabilityChecked) {
      toast({
        title: "Check Availability First",
        description: "Please check panel availability before scheduling",
        variant: "destructive"
      });
      return;
    }

    const unavailableMembers = panelMembers.filter(m => !m.available);
    if (unavailableMembers.length > 0) {
      toast({
        title: "Some Members Unavailable",
        description: "Please remove unavailable members or choose a different time",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const scheduledAt = `${formData.date}T${formData.time}:00`;
      const panelNotes = `Panel Members: ${panelMembers.map(m => `${m.name} (${m.userId})`).join(', ')}`;
      
      await createInterview(
        applicationId,
        scheduledAt,
        parseInt(formData.duration),
        'panel',
        formData.location || undefined,
        formData.meetingLink || undefined
      );

      // Notify all panel members
      for (const member of panelMembers) {
        await supabase.rpc('create_notification', {
          _user_id: user!.id,
          _target_user_id: member.userId,
          _title: 'Interview Panel Scheduled',
          _message: `You've been added to an interview panel for ${candidateName} on ${new Date(scheduledAt).toLocaleDateString()}`,
          _type: 'interview',
          _related_id: null,
          _related_type: 'interview'
        });
      }

      toast({
        title: "Success",
        description: `Panel interview scheduled with ${panelMembers.length} interviewers`,
      });

      setOpen(false);
      setFormData({
        date: '',
        time: '',
        duration: '60',
        type: 'panel',
        location: '',
        meetingLink: ''
      });
      setPanelMembers([]);
      setAvailabilityChecked(false);
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error scheduling panel interview:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule panel interview',
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
          <Users className="mr-2 h-4 w-4" />
          Schedule Panel Interview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Schedule Panel Interview</DialogTitle>
            <DialogDescription>
              Schedule a panel interview with multiple interviewers for {candidateName}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    setAvailabilityChecked(false);
                  }}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => {
                    setFormData({ ...formData, time: e.target.value });
                    setAvailabilityChecked(false);
                  }}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => {
                  setFormData({ ...formData, duration: value });
                  setAvailabilityChecked(false);
                }}
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
              <Label>Select Panel Members</Label>
              <Card>
                <CardContent className="pt-4 space-y-2 max-h-[200px] overflow-y-auto">
                  {teamMembers.map((member) => {
                    const isSelected = panelMembers.some(m => m.userId === member.user_id);
                    const memberStatus = panelMembers.find(m => m.userId === member.user_id);
                    
                    return (
                      <div key={member.user_id} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2 flex-1">
                          <Checkbox
                            id={member.user_id}
                            checked={isSelected}
                            onCheckedChange={() => togglePanelMember(member.user_id, member.display_name || member.email)}
                          />
                          <label
                            htmlFor={member.user_id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {member.display_name || member.email}
                          </label>
                        </div>
                        {availabilityChecked && memberStatus && (
                          <Badge variant={memberStatus.available ? "default" : "destructive"} className="ml-2">
                            {memberStatus.available ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Available
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3 mr-1" />
                                Busy
                              </>
                            )}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {panelMembers.length > 0 && (
              <Button
                type="button"
                variant="secondary"
                onClick={checkAvailability}
                disabled={checkingAvailability || !formData.date || !formData.time}
              >
                <Clock className="mr-2 h-4 w-4" />
                {checkingAvailability ? 'Checking...' : 'Check Availability'}
              </Button>
            )}

            <div className="grid gap-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="Conference Room A, Office"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
              <Input
                id="meetingLink"
                type="url"
                placeholder="https://meet.google.com/..."
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !availabilityChecked}>
              {loading ? 'Scheduling...' : 'Schedule Panel Interview'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}