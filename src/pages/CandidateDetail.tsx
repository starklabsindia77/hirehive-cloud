import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Phone, Linkedin, FileText, Briefcase, Calendar, Loader2 } from 'lucide-react';
import { useCandidate } from '@/hooks/useCandidate';
import { useApplications } from '@/hooks/useApplications';
import { useJobs } from '@/hooks/useJobs';
import { ScheduleInterviewDialog } from '@/components/ScheduleInterviewDialog';
import { StageSelect } from '@/components/StageSelect';
import { NotesSection } from '@/components/NotesSection';
import { ActivityFeed } from '@/components/ActivityFeed';
import { SendEmailDialog } from '@/components/SendEmailDialog';

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { candidate, loading: candidateLoading } = useCandidate(id!);
  const { applications, loading: appsLoading } = useApplications(undefined, id);
  const { jobs } = useJobs();

  const loading = candidateLoading || appsLoading;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      new: 'bg-primary',
      screening: 'bg-accent',
      interview: 'bg-success',
      offer: 'bg-warning',
      hired: 'bg-success',
      rejected: 'bg-destructive',
    };
    return colors[stage] || 'bg-muted';
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

  if (!candidate) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Candidate Not Found</h2>
          <Button onClick={() => navigate('/candidates')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Candidates
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/candidates')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Candidates
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  {getInitials(candidate.full_name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold mb-1">{candidate.full_name}</h2>
              <p className="text-muted-foreground mb-4">{candidate.current_position || 'No position'}</p>
              <Badge className={getStageColor(candidate.stage)}>{candidate.stage}</Badge>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${candidate.email}`} className="hover:underline">
                  {candidate.email}
                </a>
              </div>
              {candidate.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${candidate.phone}`} className="hover:underline">
                    {candidate.phone}
                  </a>
                </div>
              )}
              {candidate.linkedin_url && (
                <div className="flex items-center text-sm">
                  <Linkedin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    LinkedIn Profile
                  </a>
                </div>
              )}
              {candidate.current_company && (
                <div className="flex items-center text-sm">
                  <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{candidate.current_company}</span>
                </div>
              )}
              {candidate.experience_years && (
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{candidate.experience_years} years experience</span>
                </div>
              )}
            </div>

            {candidate.skills && candidate.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {candidate.resume_url && (
              <Button className="w-full mt-6" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                View Resume
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <Tabs defaultValue="applications" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="applications" className="space-y-4">
                {applications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No applications yet</p>
                ) : (
                  applications.map((app) => {
                    const job = jobs.find(j => j.id === app.job_id);
                    return (
                      <Card key={app.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">
                                {job?.title || 'Unknown Position'}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                Applied {new Date(app.applied_at).toLocaleDateString()}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Stage:</span>
                                <StageSelect 
                                  applicationId={app.id}
                                  currentStage={app.stage}
                                  candidateEmail={candidate.email}
                                  candidateName={candidate.full_name}
                                  jobTitle={job?.title}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <ScheduleInterviewDialog
                                applicationId={app.id}
                                candidateName={candidate?.full_name || 'Candidate'}
                                candidateEmail={candidate.email}
                                jobTitle={job?.title}
                              />
                              <SendEmailDialog
                                candidateEmail={candidate.email}
                                candidateName={candidate.full_name}
                                jobTitle={job?.title}
                              />
                            </div>
                          </div>
                          {app.notes && (
                            <div className="mt-4 p-3 bg-muted rounded-lg">
                              <p className="text-sm">{app.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="notes">
                <NotesSection candidateId={id!} />
              </TabsContent>

              <TabsContent value="activity">
                <ActivityFeed candidateId={id} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
}
