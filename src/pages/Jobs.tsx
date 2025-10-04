import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Users, Loader2 } from 'lucide-react';
import { CreateJobDialog } from '@/components/CreateJobDialog';
import { useJobs } from '@/hooks/useJobs';
import { useApplications } from '@/hooks/useApplications';

export default function Jobs() {
  const navigate = useNavigate();
  const { jobs, loading } = useJobs();
  const { applications } = useApplications();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.department &&
        job.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.location &&
        job.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

    const matchesDepartment =
      departmentFilter === "all" || job.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getApplicantCount = (jobId: string) => {
    return applications.filter(app => app.job_id === jobId).length;
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Open Positions</h1>
          <p className="text-muted-foreground">Manage and track all your job openings</p>
        </div>
        <CreateJobDialog />
      </div>

      {filteredJobs.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs yet</h3>
            <p className="text-muted-foreground mb-4">Create your first job posting to start recruiting</p>
            <CreateJobDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                    <CardDescription>{job.department || 'No department'}</CardDescription>
                  </div>
                  <Badge>{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {job.location || 'Remote'}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="mr-2 h-4 w-4" />
                    {job.employment_type || 'Full-time'}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {getApplicantCount(job.id)} applicants
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
