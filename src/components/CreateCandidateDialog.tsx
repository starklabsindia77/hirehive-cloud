import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, Upload } from 'lucide-react';

interface CreateCandidateDialogProps {
  onSuccess?: () => void;
  jobId?: string;
  trigger?: React.ReactNode;
}

export function CreateCandidateDialog({ onSuccess, jobId, trigger }: CreateCandidateDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    resume_url: '',
    current_company: '',
    current_position: '',
    experience_years: '',
    skills: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF, DOCX, PNG, or JPG file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setParsing(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });

      const base64Data = (reader.result as string).split(',')[1];

      // Call parse-resume edge function
      const { data, error } = await supabase.functions.invoke('parse-resume', {
        body: {
          fileData: base64Data,
          mimeType: file.type
        }
      });

      if (error) throw error;

      if (data.success && data.data) {
        // Auto-fill form with parsed data
        setFormData({
          full_name: data.data.full_name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          linkedin_url: data.data.linkedin_url || '',
          resume_url: '',
          current_company: data.data.current_company || '',
          current_position: data.data.current_position || '',
          experience_years: data.data.experience_years?.toString() || '',
          skills: data.data.skills?.join(', ') || ''
        });

        toast({
          title: 'Resume parsed successfully',
          description: 'Form has been auto-filled with candidate information',
        });
      } else {
        throw new Error('Failed to parse resume');
      }
    } catch (error) {
      console.error('Error parsing resume:', error);
      toast({
        title: 'Error parsing resume',
        description: 'Please fill in the form manually',
        variant: 'destructive',
      });
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const submitData = new FormData(e.currentTarget);
    const skillsText = submitData.get('skills') as string;
    const skills = skillsText ? skillsText.split(',').map(s => s.trim()).filter(Boolean) : null;

    setLoading(true);
    try {
      // Create candidate
      const { data: candidateId, error: candidateError } = await supabase.rpc('create_org_candidate', {
        _user_id: user.id,
        _full_name: submitData.get('full_name') as string,
        _email: submitData.get('email') as string,
        _phone: (submitData.get('phone') as string) || null,
        _linkedin_url: (submitData.get('linkedin_url') as string) || null,
        _resume_url: (submitData.get('resume_url') as string) || null,
        _current_company: (submitData.get('current_company') as string) || null,
        _current_position: (submitData.get('current_position') as string) || null,
        _experience_years: submitData.get('experience_years') ? parseInt(submitData.get('experience_years') as string) : null,
        _skills: skills
      });

      if (candidateError) throw candidateError;

      // If jobId provided, create application
      if (jobId && candidateId) {
        const { error: appError } = await supabase.rpc('create_org_application', {
          _user_id: user.id,
          _job_id: jobId,
          _candidate_id: candidateId
        });

        if (appError) throw appError;
      }

      toast({
        title: 'Success',
        description: 'Candidate created successfully',
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating candidate:', error);
      toast({
        title: 'Error',
        description: 'Failed to create candidate',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
              disabled={parsing}
            />
            <Label htmlFor="resume-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Upload Resume to Auto-Fill</p>
                  <p className="text-sm text-muted-foreground">
                    {parsing ? 'Parsing resume...' : 'PDF, DOCX, PNG, or JPG (max 10MB)'}
                  </p>
                </div>
                {parsing && <Loader2 className="h-6 w-6 animate-spin" />}
              </div>
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input 
                id="full_name" 
                name="full_name" 
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required 
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required 
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input 
                id="linkedin_url" 
                name="linkedin_url" 
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="resume_url">Resume URL</Label>
              <Input 
                id="resume_url" 
                name="resume_url" 
                type="url"
                value={formData.resume_url}
                onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="current_company">Current Company</Label>
              <Input 
                id="current_company" 
                name="current_company"
                value={formData.current_company}
                onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="current_position">Current Position</Label>
              <Input 
                id="current_position" 
                name="current_position"
                value={formData.current_position}
                onChange={(e) => setFormData({ ...formData, current_position: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input 
                id="experience_years" 
                name="experience_years" 
                type="number" 
                min="0"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Textarea 
                id="skills" 
                name="skills" 
                placeholder="e.g. JavaScript, React, Node.js"
                rows={3}
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Candidate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
