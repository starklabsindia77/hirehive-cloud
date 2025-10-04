import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, MapPin, Briefcase, Users, Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useJob } from '@/hooks/useJob';
import { useApplications } from '@/hooks/useApplications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { job, loading: jobLoading } = useJob(id!);
  const { applications, loading: appsLoading } = useApplications(id);

  const loading = jobLoading || appsLoading;

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
