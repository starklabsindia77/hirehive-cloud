import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Video, Loader2 } from 'lucide-react';
import { useInterviews } from '@/hooks/useInterviews';
import { useCandidates } from '@/hooks/useCandidates';
import { useApplications } from '@/hooks/useApplications';

export default function Interviews() {
  const { interviews, loading: interviewsLoading } = useInterviews();
  const { candidates } = useCandidates();
  const { applications } = useApplications();

  const loading = interviewsLoading;

  const getInterviewDetails = (interview: any) => {
    const application = applications.find(a => a.id === interview.application_id);
    const candidate = application ? candidates.find(c => c.id === application.candidate_id) : null;
    return { application, candidate };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'onsite':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-primary',
      completed: 'bg-success',
      cancelled: 'bg-destructive',
    };
    return colors[status] || 'bg-muted';
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Interviews</h1>
        <p className="text-muted-foreground">Manage and track all scheduled interviews</p>
      </div>

      {interviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No interviews scheduled</h3>
            <p className="text-muted-foreground">Schedule interviews from candidate application pages</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview) => {
            const { candidate } = getInterviewDetails(interview);
            
            return (
              <Card key={interview.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-1">
                        {candidate?.full_name || 'Unknown Candidate'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {candidate?.current_position || 'No position'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(interview.status)}>
                      {interview.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{new Date(interview.scheduled_at).toLocaleDateString()}</span>
                      <Clock className="ml-4 mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{new Date(interview.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="ml-2 text-muted-foreground">
                        ({interview.duration_minutes} min)
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      {getTypeIcon(interview.interview_type)}
                      <span className="ml-2 capitalize">{interview.interview_type.replace('_', ' ')}</span>
                    </div>

                    {interview.location && (
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{interview.location}</span>
                      </div>
                    )}

                    {interview.meeting_link && (
                      <div className="flex items-center text-sm">
                        <Video className="mr-2 h-4 w-4 text-muted-foreground" />
                        <a 
                          href={interview.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}

                    {interview.interviewer_notes && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Notes:</p>
                        <p className="text-sm text-muted-foreground">{interview.interviewer_notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
