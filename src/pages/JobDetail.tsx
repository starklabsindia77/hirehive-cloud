import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Edit, Trash2, MapPin, Briefcase, Users, Calendar, Loader2, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useJob } from '@/hooks/useJob';
import { useApplications } from '@/hooks/useApplications';
import { useCandidates } from '@/hooks/useCandidates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CreateCandidateDialog } from '@/components/CreateCandidateDialog';
import { CandidateMatchScore } from '@/components/CandidateMatchScore';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { job, loading: jobLoading } = useJob(id!);
  const { applications, loading: appsLoading, refetch: refetchApplications } = useApplications(id);
  const { candidates, loading: candidatesLoading } = useCandidates();

  const loading = jobLoading || appsLoading || candidatesLoading;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const applicantCandidates = candidates.filter(c => 
    applications.some(app => app.candidate_id === c.id)
  );

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    if (!user || !id) return;

    try {
      const { error } = await supabase.rpc('delete_org_job', {
        _user_id: user.id,
        _job_id: id
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Job posting deleted successfully',
      });
      navigate('/jobs');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete job posting',
        variant: 'destructive',
      });
    }
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

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
          <Button onClick={() => navigate('/jobs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/jobs')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{job.status}</Badge>
                    <Badge variant="outline">{job.department || 'No department'}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {job.description || 'No description provided'}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {job.requirements || 'No requirements listed'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <Tabs defaultValue="applicants" className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>Job Information</CardTitle>
                  <CreateCandidateDialog jobId={id} onSuccess={refetchApplications} />
                </div>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="applicants">Applicants ({applicantCandidates.length})</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="applicants">
                  {applicantCandidates.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No applicants yet</p>
                  ) : (
                    <div className="space-y-3">
                      {applicantCandidates.map((candidate) => {
                        const application = applications.find(app => app.candidate_id === candidate.id);
                        return (
                          <Card 
                            key={candidate.id}
                            className="cursor-pointer hover:shadow-md transition-all"
                            onClick={() => navigate(`/candidates/${candidate.id}`)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Avatar>
                                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                                    {getInitials(candidate.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-sm">{candidate.full_name}</h4>
                                    <Badge variant="secondary">{application?.stage || 'screening'}</Badge>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                    <Briefcase className="w-3 h-3" />
                                    <span className="truncate">{candidate.current_position || 'No position'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{candidate.email}</span>
                                  </div>
                                  {candidate.phone && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Phone className="w-3 h-3" />
                                      <span>{candidate.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="activity">
                  <ActivityFeed jobId={id} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {job.requirements && applicantCandidates.length > 0 && (
            <CandidateMatchScore 
              jobId={id!}
              jobRequirements={job.requirements}
              candidates={applicantCandidates}
            />
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{job.location || 'Remote'}</span>
              </div>
              <div className="flex items-center text-sm">
                <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{job.employment_type || 'Full-time'}</span>
              </div>
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{applications.length} applicants</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p>{new Date(job.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <p>{new Date(job.updated_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
