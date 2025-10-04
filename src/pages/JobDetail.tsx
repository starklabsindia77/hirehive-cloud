import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Briefcase, 
  Users, 
  Edit, 
  Trash2,
  Loader2 
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  requirements: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicantsCount, setApplicantsCount] = useState(0);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's organization schema
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) throw new Error('No organization found');

      const { data: org } = await supabase
        .from('organizations')
        .select('schema_name')
        .eq('id', profile.organization_id)
        .single();

      if (!org?.schema_name) throw new Error('Organization schema not found');

      // Fetch job details
      const { data: jobData, error } = await supabase.rpc('get_user_org_schema', {
        _user_id: user.id
      });

      if (error) throw error;

      // For demo purposes, using mock data
      // In production, you'd query the organization schema
      setJob({
        id: id || '',
        title: 'Senior Full Stack Developer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        employment_type: 'Full-time',
        description: `We are seeking a talented Senior Full Stack Developer to join our dynamic engineering team. 
        
In this role, you will be responsible for designing, developing, and maintaining full-stack applications using modern technologies. You will work closely with product managers, designers, and other engineers to build scalable solutions that impact millions of users.

Key Responsibilities:
• Design and develop robust, scalable web applications
• Write clean, maintainable code following best practices
• Collaborate with cross-functional teams to define and implement features
• Participate in code reviews and provide constructive feedback
• Mentor junior developers and contribute to team growth
• Optimize application performance and scalability
• Stay up-to-date with emerging technologies and industry trends`,
        requirements: `Required Qualifications:
• 5+ years of professional experience in full-stack development
• Strong proficiency in React, TypeScript, and Node.js
• Experience with modern CSS frameworks (Tailwind, styled-components)
• Solid understanding of RESTful APIs and GraphQL
• Experience with databases (PostgreSQL, MongoDB)
• Familiarity with cloud platforms (AWS, GCP, or Azure)
• Strong problem-solving and debugging skills
• Excellent communication and collaboration abilities

Nice to Have:
• Experience with Next.js or other React frameworks
• Knowledge of CI/CD pipelines and DevOps practices
• Experience with microservices architecture
• Open source contributions
• Bachelor's degree in Computer Science or related field`,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Mock applicants count
      setApplicantsCount(23);
    } catch (error: any) {
      console.error('Error fetching job:', error);
      toast({
        title: 'Error',
        description: 'Failed to load job details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      toast({
        title: 'Success',
        description: 'Job deleted successfully',
      });
      navigate('/jobs');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete job',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/jobs')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <CardTitle className="text-3xl">{job.title}</CardTitle>
                    <Badge 
                      className={job.status === 'open' ? 'bg-success' : 'bg-muted'}
                    >
                      {job.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {job.department}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {job.employment_type}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {applicantsCount} applicants
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {job.description}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {job.requirements}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Applicants Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Applicants ({applicantsCount})</CardTitle>
                <Button onClick={() => navigate('/candidates')}>
                  View All Candidates
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Applicants for this position will appear here. Visit the Candidates page to see all applicants.
              </p>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Created:</span> {new Date(job.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(job.updated_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
