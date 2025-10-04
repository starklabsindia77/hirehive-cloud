import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Briefcase, MapPin, Clock, Building2, Loader2, CheckCircle } from 'lucide-react';
import { usePublicJob } from '@/hooks/usePublicJobs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { notifyNewApplication } from '@/components/CreateApplicationNotification';

export default function CareerJobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { job, loading } = usePublicJob(id!);
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    currentCompany: '',
    currentPosition: '',
    experienceYears: '',
    skills: '',
    coverLetter: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job?.organization_schema) {
      toast({
        title: 'Error',
        description: 'Job information is incomplete',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const skillsArray = formData.skills 
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : null;

      const { data, error } = await supabase.rpc('submit_public_application', {
        _org_schema: job.organization_schema,
        _job_id: job.id,
        _full_name: formData.fullName,
        _email: formData.email,
        _phone: formData.phone || null,
        _linkedin_url: formData.linkedinUrl || null,
        _cover_letter: formData.coverLetter || null,
        _current_company: formData.currentCompany || null,
        _current_position: formData.currentPosition || null,
        _experience_years: formData.experienceYears ? parseInt(formData.experienceYears) : null,
        _skills: skillsArray,
      });

      if (error) throw error;

      // Send notifications to team members about new application
      if (data && job.organization_schema) {
        // Get the application/candidate ID from the response
        const applicationId = data;
        
        // Notify all team members
        await notifyNewApplication(
          job.organization_schema,
          formData.fullName,
          job.title,
          applicationId,
          job.id
        );
      }

      setSubmitted(true);
      toast({
        title: 'Application Submitted!',
        description: 'Thank you for your interest. We will review your application and get back to you soon.',
      });
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        <header className="border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <Link to="/careers" className="inline-flex items-center gap-2 hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
          <p className="text-muted-foreground mb-8">This position may no longer be available.</p>
          <Link to="/careers">
            <Button>View All Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        <header className="border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <Link to="/careers" className="inline-flex items-center gap-2 hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="pt-12 pb-12">
              <CheckCircle className="h-16 w-16 mx-auto mb-6 text-success" />
              <h2 className="text-3xl font-bold mb-4">Application Submitted!</h2>
              <p className="text-muted-foreground mb-8">
                Thank you for applying to the <strong>{job.title}</strong> position at{' '}
                <strong>{job.organization_name}</strong>.
              </p>
              <p className="text-muted-foreground mb-8">
                We have received your application and will review it shortly. If your qualifications
                match our needs, we'll be in touch soon.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/careers">
                  <Button variant="outline">View More Jobs</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Link to="/careers" className="inline-flex items-center gap-2 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Job Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-3">
                      {job.employment_type || 'Full-time'}
                    </Badge>
                    <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                    <CardDescription className="flex flex-wrap gap-4 text-base">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {job.organization_name}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                      )}
                      {job.department && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.department}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {job.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                    <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                      {job.description}
                    </div>
                  </div>
                )}
                {job.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                    <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                      {job.requirements}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Apply for this position</CardTitle>
                <CardDescription>Fill out the form below to submit your application</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                    <Input
                      id="linkedinUrl"
                      name="linkedinUrl"
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentCompany">Current Company</Label>
                    <Input
                      id="currentCompany"
                      name="currentCompany"
                      value={formData.currentCompany}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentPosition">Current Position</Label>
                    <Input
                      id="currentPosition"
                      name="currentPosition"
                      value={formData.currentPosition}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceYears">Years of Experience</Label>
                    <Input
                      id="experienceYears"
                      name="experienceYears"
                      type="number"
                      min="0"
                      value={formData.experienceYears}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      name="skills"
                      placeholder="React, TypeScript, Node.js"
                      value={formData.skills}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter</Label>
                    <Textarea
                      id="coverLetter"
                      name="coverLetter"
                      rows={6}
                      placeholder="Tell us why you're a great fit for this role..."
                      value={formData.coverLetter}
                      onChange={handleChange}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Application
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
