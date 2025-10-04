import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, FileText, Loader2, Wand2 } from 'lucide-react';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [generationInputs, setGenerationInputs] = useState({
    title: '',
    department: '',
    location: '',
    employmentType: 'Full-time',
    keyRequirements: '',
    companyInfo: '',
  });
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

  const handleGenerateJD = async () => {
    if (!generationInputs.title.trim()) {
      toast({
        title: 'Error',
        description: 'Job title is required to generate a description',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job-description', {
        body: {
          title: generationInputs.title,
          department: generationInputs.department,
          location: generationInputs.location,
          employmentType: generationInputs.employmentType,
          keyRequirements: generationInputs.keyRequirements,
          companyInfo: generationInputs.companyInfo,
        }
      });

      if (error) throw error;

      if (data?.success && data?.description) {
        // Parse the generated description into form fields
        setFormData({
          title: generationInputs.title,
          department: generationInputs.department,
          location: generationInputs.location,
          employment_type: generationInputs.employmentType,
          description: data.description,
          requirements: generationInputs.keyRequirements,
        });
        
        toast({
          title: 'Success!',
          description: 'Job description generated successfully',
        });
      } else {
        throw new Error('Failed to generate job description');
      }
    } catch (error: any) {
      console.error('Error generating JD:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate job description',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
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

      // Use RPC function to insert job into organization schema
      const { data, error } = await supabase.rpc('insert_organization_job', {
        _title: formData.title,
        _department: formData.department || null,
        _location: formData.location || null,
        _employment_type: formData.employment_type,
        _description: formData.description,
        _requirements: formData.requirements || null,
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

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">
              <Wand2 className="w-4 h-4 mr-2" />
              AI Generate
            </TabsTrigger>
            <TabsTrigger value="parse">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Parse
            </TabsTrigger>
            <TabsTrigger value="manual">
              <FileText className="w-4 h-4 mr-2" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gen-title">Job Title *</Label>
                <Input
                  id="gen-title"
                  value={generationInputs.title}
                  onChange={(e) => setGenerationInputs({ ...generationInputs, title: e.target.value })}
                  placeholder="e.g., Senior Full Stack Developer"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gen-department">Department</Label>
                  <Input
                    id="gen-department"
                    value={generationInputs.department}
                    onChange={(e) => setGenerationInputs({ ...generationInputs, department: e.target.value })}
                    placeholder="Engineering"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gen-location">Location</Label>
                  <Input
                    id="gen-location"
                    value={generationInputs.location}
                    onChange={(e) => setGenerationInputs({ ...generationInputs, location: e.target.value })}
                    placeholder="Remote / San Francisco"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gen-type">Employment Type</Label>
                <Input
                  id="gen-type"
                  value={generationInputs.employmentType}
                  onChange={(e) => setGenerationInputs({ ...generationInputs, employmentType: e.target.value })}
                  placeholder="Full-time"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gen-requirements">Key Requirements (Optional)</Label>
                <Textarea
                  id="gen-requirements"
                  value={generationInputs.keyRequirements}
                  onChange={(e) => setGenerationInputs({ ...generationInputs, keyRequirements: e.target.value })}
                  placeholder="e.g., 5+ years React experience, TypeScript, AWS..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gen-company">Company Info (Optional)</Label>
                <Textarea
                  id="gen-company"
                  value={generationInputs.companyInfo}
                  onChange={(e) => setGenerationInputs({ ...generationInputs, companyInfo: e.target.value })}
                  placeholder="Brief description of your company, culture, or mission..."
                  className="min-h-[60px]"
                />
              </div>

              <Button 
                onClick={handleGenerateJD} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Job Description
                  </>
                )}
              </Button>
            </div>

            {formData.title && formData.description && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold">Generated Job Description</h4>
                <div className="bg-muted/50 p-4 rounded-lg max-h-[300px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{formData.description}</pre>
                </div>
                <JobFormFields formData={formData} setFormData={setFormData} hideDescription />
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

          <TabsContent value="parse" className="space-y-4">
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
  setFormData,
  hideDescription 
}: { 
  formData: JobFormData; 
  setFormData: (data: JobFormData) => void;
  hideDescription?: boolean;
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

      {!hideDescription && (
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
      )}

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
