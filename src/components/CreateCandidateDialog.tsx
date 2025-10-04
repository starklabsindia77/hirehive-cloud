import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus } from 'lucide-react';

interface CreateCandidateDialogProps {
  onSuccess?: () => void;
  jobId?: string;
  trigger?: React.ReactNode;
}

export function CreateCandidateDialog({ onSuccess, jobId, trigger }: CreateCandidateDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const skillsText = formData.get('skills') as string;
    const skills = skillsText ? skillsText.split(',').map(s => s.trim()).filter(Boolean) : null;

    setLoading(true);
    try {
      // Create candidate
      const { data: candidateId, error: candidateError } = await supabase.rpc('create_org_candidate', {
        _user_id: user.id,
        _full_name: formData.get('full_name') as string,
        _email: formData.get('email') as string,
        _phone: (formData.get('phone') as string) || null,
        _linkedin_url: (formData.get('linkedin_url') as string) || null,
        _resume_url: (formData.get('resume_url') as string) || null,
        _current_company: (formData.get('current_company') as string) || null,
        _current_position: (formData.get('current_position') as string) || null,
        _experience_years: formData.get('experience_years') ? parseInt(formData.get('experience_years') as string) : null,
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
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" name="full_name" required />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input id="linkedin_url" name="linkedin_url" type="url" />
            </div>
            <div>
              <Label htmlFor="resume_url">Resume URL</Label>
              <Input id="resume_url" name="resume_url" type="url" />
            </div>
            <div>
              <Label htmlFor="current_company">Current Company</Label>
              <Input id="current_company" name="current_company" />
            </div>
            <div>
              <Label htmlFor="current_position">Current Position</Label>
              <Input id="current_position" name="current_position" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input id="experience_years" name="experience_years" type="number" min="0" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Textarea 
                id="skills" 
                name="skills" 
                placeholder="e.g. JavaScript, React, Node.js"
                rows={3}
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
