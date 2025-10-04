import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';

interface CreateCustomPlanDialogProps {
  organizationId: string;
  organizationName: string;
}

export function CreateCustomPlanDialog({ organizationId, organizationName }: CreateCustomPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const { createCustomPlan } = useSuperAdmin();

  const [formData, setFormData] = useState({
    name: `${organizationName} Enterprise`,
    priceMonthly: 999,
    priceYearly: 9990,
    aiTokensMonthly: 1000000,
    emailCreditsMonthly: 50000,
    storageGb: 1000,
    teamMembersLimit: 100,
    jobsLimit: 10000,
    candidatesLimit: 100000
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createCustomPlan.mutateAsync({
      organizationId,
      ...formData
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Enterprise Plan for {organizationName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceMonthly">Monthly Price ($) *</Label>
              <Input
                id="priceMonthly"
                type="number"
                value={formData.priceMonthly}
                onChange={(e) => setFormData({ ...formData, priceMonthly: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceYearly">Yearly Price ($) *</Label>
              <Input
                id="priceYearly"
                type="number"
                value={formData.priceYearly}
                onChange={(e) => setFormData({ ...formData, priceYearly: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiTokens">AI Tokens/Month *</Label>
              <Input
                id="aiTokens"
                type="number"
                value={formData.aiTokensMonthly}
                onChange={(e) => setFormData({ ...formData, aiTokensMonthly: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailCredits">Email Credits/Month *</Label>
              <Input
                id="emailCredits"
                type="number"
                value={formData.emailCreditsMonthly}
                onChange={(e) => setFormData({ ...formData, emailCreditsMonthly: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage">Storage (GB) *</Label>
              <Input
                id="storage"
                type="number"
                value={formData.storageGb}
                onChange={(e) => setFormData({ ...formData, storageGb: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamMembers">Team Members Limit *</Label>
              <Input
                id="teamMembers"
                type="number"
                value={formData.teamMembersLimit}
                onChange={(e) => setFormData({ ...formData, teamMembersLimit: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobs">Jobs Limit *</Label>
              <Input
                id="jobs"
                type="number"
                value={formData.jobsLimit}
                onChange={(e) => setFormData({ ...formData, jobsLimit: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="candidates">Candidates Limit *</Label>
              <Input
                id="candidates"
                type="number"
                value={formData.candidatesLimit}
                onChange={(e) => setFormData({ ...formData, candidatesLimit: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCustomPlan.isPending}>
              {createCustomPlan.isPending ? 'Creating...' : 'Create Custom Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
