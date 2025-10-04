import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  FileText,
  Linkedin,
  Download,
  Loader2,
  Plus
} from 'lucide-react';

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  resume_url: string;
  current_company: string;
  current_position: string;
  experience_years: number;
  skills: string[];
  status: string;
  stage: string;
  created_at: string;
  updated_at: string;
}

interface Application {
  id: string;
  job_title: string;
  applied_at: string;
  status: string;
  stage: string;
}

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidateDetails();
  }, [id]);

  const fetchCandidateDetails = async () => {
    try {
      // For demo purposes, using mock data
      // In production, you'd query the organization schema
      setCandidate({
        id: id || '',
        full_name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        linkedin_url: 'https://linkedin.com/in/sarahjohnson',
        resume_url: '',
        current_company: 'Tech Innovations Inc',
        current_position: 'Senior Software Engineer',
        experience_years: 7,
        skills: [
          'React', 'TypeScript', 'Node.js', 'AWS', 'PostgreSQL',
          'Docker', 'CI/CD', 'Agile', 'REST APIs', 'GraphQL'
        ],
        status: 'active',
        stage: 'interview',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Mock applications
      setApplications([
        {
          id: '1',
          job_title: 'Senior Full Stack Developer',
          applied_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          stage: 'interview',
        },
        {
          id: '2',
          job_title: 'Lead Frontend Engineer',
          applied_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          stage: 'technical_assessment',
        },
      ]);
    } catch (error: any) {
      console.error('Error fetching candidate:', error);
      toast({
        title: 'Error',
        description: 'Failed to load candidate details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  if (!candidate) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Candidate Not Found</h2>
          <Button onClick={() => navigate('/candidates')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Candidates
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'applied': 'bg-blue-500',
      'screening': 'bg-purple-500',
      'interview': 'bg-orange-500',
      'offer': 'bg-green-500',
      'hired': 'bg-success',
      'rejected': 'bg-destructive',
    };
    return colors[stage] || 'bg-muted';
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/candidates')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Candidates
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Candidate Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      {getInitials(candidate.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-2xl font-bold mb-1">{candidate.full_name}</h2>
                  <p className="text-muted-foreground mb-4">{candidate.current_position}</p>
                  
                  <Badge className={getStageColor(candidate.stage)}>
                    {candidate.stage.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <a href={`mailto:${candidate.email}`} className="text-sm hover:underline break-all">
                        {candidate.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${candidate.phone}`} className="text-sm hover:underline">
                      {candidate.phone}
                    </a>
                  </div>

                  {candidate.linkedin_url && (
                    <div className="flex items-center gap-3">
                      <Linkedin className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={candidate.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <div className="text-sm">
                      <div className="font-medium">{candidate.current_company}</div>
                      <div className="text-muted-foreground">{candidate.experience_years} years experience</div>
                    </div>
                  </div>
                </div>

                {candidate.resume_url && (
                  <Button className="w-full mt-6" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Applications & Activity */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="applications" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="applications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Job Applications</CardTitle>
                      <Badge variant="secondary">{applications.length} active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {applications.map((app) => (
                      <div 
                        key={app.id}
                        className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                        onClick={() => navigate(`/jobs/${app.id}`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{app.job_title}</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              Applied {new Date(app.applied_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStageColor(app.stage)}>
                            {app.stage.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Schedule Interview
                          </Button>
                          <Button size="sm" variant="outline">
                            Send Email
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-2 bg-primary rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Application submitted</p>
                          <p className="text-xs text-muted-foreground">Senior Full Stack Developer</p>
                          <p className="text-xs text-muted-foreground mt-1">7 days ago</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-2 bg-accent rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Resume reviewed</p>
                          <p className="text-xs text-muted-foreground">By John Smith</p>
                          <p className="text-xs text-muted-foreground mt-1">5 days ago</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-2 bg-success rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Interview scheduled</p>
                          <p className="text-xs text-muted-foreground">Technical interview on Dec 15</p>
                          <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recruiter Notes</CardTitle>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      No notes yet. Add notes to track important information about this candidate.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
