import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/hooks/useJobs';
import { Loader2, Link } from 'lucide-react';

interface LinkCandidateToJobDialogProps {
  candidateId: string;
  onSuccess?: () => void;
}

export function LinkCandidateToJobDialog({ candidateId, onSuccess }: LinkCandidateToJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();
  const { jobs, loading: jobsLoading } = useJobs();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !selectedJobId) return;

    const formData = new FormData(e.currentTarget);
    const notes = formData.get('notes') as string;

    setLoading(true);
    try {
      const { data: schemaName } = await supabase.rpc('get_user_org_schema', {
        _user_id: user.id
      });

      if (!schemaName) throw new Error('No organization found');

      // Check if application already exists
      const { data: existing } = await supabase.rpc('get_org_applications', {
        _user_id: user.id,
        _job_id: selectedJobId,
        _candidate_id: candidateId
      });

      if (existing && existing.length > 0) {
        toast({
          title: 'Already linked',
          description: 'This candidate is already linked to this job',
          variant: 'destructive',
        });
        return;
      }

      // Create application
      const applicationId = crypto.randomUUID();
      await supabase.rpc('execute_sql', {
        query: `
          INSERT INTO ${schemaName}.applications (id, job_id, candidate_id, status, stage, notes)
          VALUES ('${applicationId}', '${selectedJobId}', '${candidateId}', 'applied', 'screening', ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'})
        `
      });

      toast({
        title: 'Success',
        description: 'Candidate linked to job successfully',
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error linking candidate:', error);
      toast({
        title: 'Error',
        description: 'Failed to link candidate to job',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Link className="mr-2 h-4 w-4" />
          Link to Job
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Candidate to Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="job">Select Job *</Label>
            {jobsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Select value={selectedJobId} onValueChange={setSelectedJobId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.filter(j => j.status === 'open').map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} - {job.department || 'No department'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Add any notes about this application..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedJobId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Link to Job
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
