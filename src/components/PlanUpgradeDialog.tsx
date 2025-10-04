import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap } from 'lucide-react';
import { useSubscription, SubscriptionPlan } from '@/hooks/useSubscription';
import { useOrganization } from '@/contexts/OrganizationContext';

interface PlanUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanUpgradeDialog({ open, onOpenChange }: PlanUpgradeDialogProps) {
  const { organization } = useOrganization();
  const { plans, subscription, upgradeSubscription, isUpgrading } = useSubscription(organization?.id);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handleUpgrade = () => {
    if (selectedPlanId) {
      upgradeSubscription(selectedPlanId);
      onOpenChange(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    return subscription?.plan_id === plan.id;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Choose the plan that best fits your needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {plans?.map((plan) => (
            <div
              key={plan.id}
              className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                selectedPlanId === plan.id
                  ? 'border-primary shadow-md'
                  : 'border-border hover:border-primary/50'
              } ${isCurrentPlan(plan) ? 'opacity-50' : ''}`}
              onClick={() => !isCurrentPlan(plan) && setSelectedPlanId(plan.id)}
            >
              {isCurrentPlan(plan) && (
                <Badge className="absolute top-2 right-2" variant="secondary">
                  Current
                </Badge>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{formatPrice(plan.price_monthly)}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    or {formatPrice(plan.price_yearly)}/year
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{plan.ai_tokens_monthly.toLocaleString()} AI tokens</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{plan.email_credits_monthly.toLocaleString()} emails</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{plan.storage_gb}GB storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>
                      {plan.team_members_limit === 999999 ? 'Unlimited' : plan.team_members_limit} team members
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>
                      {plan.jobs_limit === 999999 ? 'Unlimited' : plan.jobs_limit} jobs
                    </span>
                  </div>
                  
                  {plan.features.advanced_analytics && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Advanced Analytics</span>
                    </div>
                  )}
                  {plan.features.custom_branding && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Custom Branding</span>
                    </div>
                  )}
                  {plan.features.priority_support && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Priority Support</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={!selectedPlanId || isUpgrading}
          >
            <Zap className="h-4 w-4 mr-2" />
            {isUpgrading ? 'Upgrading...' : 'Upgrade Now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
