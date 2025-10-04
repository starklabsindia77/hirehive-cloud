import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, FileText, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface JobFormData {
  title: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  requirements: string;
}

export function CreateJobDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isParsingJD, setIsParsingJD] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    department: '',
    location: '',
    employment_type: 'Full-time',
    description: '',
    requirements: '',
  });

  const handleParseJD = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste a job description first',
        variant: 'destructive',
      });
      return;
    }

    setIsParsingJD(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-job-description', {
        body: { jobDescription }
      });

      if (error) throw error;

      if (data?.success && data?.job) {
        setFormData({
          title: data.job.title || '',
          department: data.job.department || '',
          location: data.job.location || '',
          employment_type: data.job.employment_type || 'Full-time',
          description: data.job.description || '',
          requirements: data.job.requirements || '',
        });
        
        toast({
          title: 'Success!',
          description: 'Job description parsed successfully',
        });
      } else {
        throw new Error('Failed to parse job description');
      }
    } catch (error: any) {
      console.error('Error parsing JD:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to parse job description',
        variant: 'destructive',
      });
    } finally {
      setIsParsingJD(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast({
        title: 'Error',
        description: 'Title and description are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
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

      // Insert job into organization's schema
      const { error } = await supabase
        .rpc('execute_sql', {
          sql: `
            INSERT INTO ${org.schema_name}.jobs (
              title, department, location, employment_type, 
              description, requirements, created_by, status
            ) VALUES (
              '${formData.title.replace(/'/g, "''")}',
              '${formData.department.replace(/'/g, "''")}',
              '${formData.location.replace(/'/g, "''")}',
              '${formData.employment_type}',
              '${formData.description.replace(/'/g, "''")}',
              '${formData.requirements.replace(/'/g, "''")}',
              '${user.id}',
              'open'
            )
          `
        });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Job created successfully',
      });

      setOpen(false);
      setFormData({
        title: '',
        department: '',
        location: '',
        employment_type: 'Full-time',
        description: '',
        requirements: '',
      });
      setJobDescription('');
      
      // Refresh page to show new job
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating job:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create job',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Create Job with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Parse a job description with AI or create manually
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Parser
            </TabsTrigger>
            <TabsTrigger value="manual">
              <FileText className="w-4 h-4 mr-2" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4">
            <div className="space-y-2">
              <Label>Paste Job Description</Label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                className="min-h-[200px]"
              />
              <Button 
                onClick={handleParseJD} 
                disabled={isParsingJD}
                className="w-full"
              >
                {isParsingJD ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Parsing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Parse with AI
                  </>
                )}
              </Button>
            </div>

            {formData.title && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold">Parsed Results</h4>
                <JobFormFields formData={formData} setFormData={setFormData} />
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? 'Creating...' : 'Create Job'}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <JobFormFields formData={formData} setFormData={setFormData} />
              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? 'Creating...' : 'Create Job'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function JobFormFields({ 
  formData, 
  setFormData 
}: { 
  formData: JobFormData; 
  setFormData: (data: JobFormData) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="employment_type">Employment Type</Label>
        <Input
          id="employment_type"
          value={formData.employment_type}
          onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="min-h-[150px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          className="min-h-[100px]"
        />
      </div>
    </>
  );
}
