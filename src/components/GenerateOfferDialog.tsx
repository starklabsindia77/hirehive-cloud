import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { generateOfferLetter, createOffer } from '@/hooks/useOffers';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';

interface GenerateOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: {
    id: string;
    full_name: string;
    application_id: string;
    job_id: string;
    job_title: string;
    department?: string;
  };
  onSuccess?: () => void;
}

export function GenerateOfferDialog({
  open,
  onOpenChange,
  candidate,
  onSuccess,
}: GenerateOfferDialogProps) {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    jobTitle: candidate.job_title,
    department: candidate.department || '',
    salary: '',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    benefits: 'Health Insurance, 401(k), Paid Time Off, Remote Work',
  });
  
  const [offerLetter, setOfferLetter] = useState('');

  const handleGenerate = async () => {
    if (!formData.salary) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a salary amount',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    try {
      const letter = await generateOfferLetter({
        candidateName: candidate.full_name,
        jobTitle: formData.jobTitle,
        department: formData.department,
        salary: parseFloat(formData.salary),
        startDate: formData.startDate,
        benefits: formData.benefits.split(',').map(b => b.trim()),
        companyName: organization?.brand_name || organization?.name || 'Our Company',
      });

      setOfferLetter(letter);
      toast({
        title: 'Offer Letter Generated',
        description: 'Review and edit the letter before sending',
      });
    } catch (error: any) {
      console.error('Error generating offer:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate offer letter',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user || !offerLetter) return;

    setSaving(true);
    try {
      await createOffer({
        userId: user.id,
        applicationId: candidate.application_id,
        candidateId: candidate.id,
        jobId: candidate.job_id,
        offerLetterContent: offerLetter,
        jobTitle: formData.jobTitle,
        startDate: formData.startDate,
        salaryAmount: parseFloat(formData.salary),
        benefits: formData.benefits.split(',').map(b => b.trim()),
      });

      toast({
        title: 'Offer Created',
        description: 'The offer has been saved as a draft',
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating offer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create offer',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Offer Letter for {candidate.full_name}
          </DialogTitle>
          <DialogDescription>
            Fill in the details and generate a professional offer letter using AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Form Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Annual Salary (USD)</Label>
              <Input
                id="salary"
                type="number"
                placeholder="85000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="benefits">Benefits (comma-separated)</Label>
              <Input
                id="benefits"
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                placeholder="Health Insurance, 401(k), PTO"
              />
            </div>
          </div>

          {/* Generate Button */}
          {!offerLetter && (
            <Button 
              onClick={handleGenerate} 
              disabled={generating}
              className="w-full"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Offer Letter
                </>
              )}
            </Button>
          )}

          {/* Offer Letter Editor */}
          {offerLetter && (
            <>
              <div className="space-y-2">
                <Label htmlFor="offerLetter">Generated Offer Letter</Label>
                <Textarea
                  id="offerLetter"
                  value={offerLetter}
                  onChange={(e) => setOfferLetter(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Review and edit the offer letter before saving
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleGenerate} 
                  variant="outline"
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Regenerate
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Offer'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
