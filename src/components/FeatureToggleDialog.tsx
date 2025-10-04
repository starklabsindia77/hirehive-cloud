import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings2 } from 'lucide-react';
import { useSuperAdmin, useOrganizationFeatures } from '@/hooks/useSuperAdmin';

interface FeatureToggleDialogProps {
  organizationId: string;
  organizationName: string;
}

const AVAILABLE_FEATURES = [
  { key: 'ai_resume_parsing', label: 'AI Resume Parsing', hasLimit: true },
  { key: 'ai_job_matching', label: 'AI Job Matching', hasLimit: true },
  { key: 'ai_offer_generation', label: 'AI Offer Generation', hasLimit: true },
  { key: 'bulk_email', label: 'Bulk Email', hasLimit: true },
  { key: 'interview_scheduling', label: 'Interview Scheduling', hasLimit: false },
  { key: 'team_collaboration', label: 'Team Collaboration', hasLimit: false },
  { key: 'custom_branding', label: 'Custom Branding', hasLimit: false },
  { key: 'api_access', label: 'API Access', hasLimit: true },
  { key: 'advanced_analytics', label: 'Advanced Analytics', hasLimit: false },
  { key: 'white_label', label: 'White Label', hasLimit: false }
];

export function FeatureToggleDialog({ organizationId, organizationName }: FeatureToggleDialogProps) {
  const [open, setOpen] = useState(false);
  const { toggleFeature } = useSuperAdmin();
  const { data: existingFeatures } = useOrganizationFeatures(organizationId);

  const [selectedFeature, setSelectedFeature] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [customLimit, setCustomLimit] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  const selectedFeatureData = AVAILABLE_FEATURES.find(f => f.key === selectedFeature);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFeature) return;

    await toggleFeature.mutateAsync({
      organizationId,
      featureKey: selectedFeature,
      isEnabled,
      customLimit: selectedFeatureData?.hasLimit ? customLimit : undefined,
      notes
    });

    setOpen(false);
    setSelectedFeature('');
    setIsEnabled(true);
    setCustomLimit(undefined);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings2 className="w-4 h-4 mr-2" />
          Manage Features
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Manage Features for {organizationName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mb-4">
          <h4 className="font-medium text-sm">Current Features</h4>
          {existingFeatures && existingFeatures.length > 0 ? (
            <div className="space-y-2">
              {existingFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{feature.feature_key}</span>
                    {feature.custom_limit && (
                      <span className="text-sm text-muted-foreground ml-2">
                        (Limit: {feature.custom_limit})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${feature.is_enabled ? 'text-green-600' : 'text-red-600'}`}>
                      {feature.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No custom features configured</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feature">Feature *</Label>
            <Select value={selectedFeature} onValueChange={setSelectedFeature}>
              <SelectTrigger>
                <SelectValue placeholder="Select feature" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_FEATURES.map((feature) => (
                  <SelectItem key={feature.key} value={feature.key}>
                    {feature.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enable Feature</Label>
            <Switch
              id="enabled"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>

          {selectedFeatureData?.hasLimit && (
            <div className="space-y-2">
              <Label htmlFor="limit">Custom Limit (optional)</Label>
              <Input
                id="limit"
                type="number"
                placeholder="Leave empty for unlimited"
                value={customLimit || ''}
                onChange={(e) => setCustomLimit(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Internal notes about this feature configuration"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedFeature || toggleFeature.isPending}>
              {toggleFeature.isPending ? 'Saving...' : 'Save Feature'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
