import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlanUpgradeDialog } from '@/components/PlanUpgradeDialog';
import { useSubscription } from '@/hooks/useSubscription';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Zap, Mail, HardDrive, CreditCard, Calendar, TrendingUp } from 'lucide-react';

export default function Billing() {
  const { organization } = useOrganization();
  const { subscription, usage, plans, getUsagePercentage } = useSubscription(organization?.id);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const daysUntilReset = usage
    ? Math.ceil((new Date(usage.period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing & Usage</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and monitor resource usage
          </p>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            {subscription && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{subscription.plan?.name}</h3>
                    <p className="text-muted-foreground">
                      {formatPrice(subscription.plan?.price_monthly || 0)}/month
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        subscription.status === 'active'
                          ? 'default'
                          : subscription.status === 'trial'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {subscription.status}
                    </Badge>
                    {subscription.status === 'trial' && subscription.trial_ends_at && (
                      <Badge variant="outline">
                        Trial ends {new Date(subscription.trial_ends_at).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Current Period</p>
                      <p className="text-sm font-medium">
                        {new Date(subscription.current_period_start).toLocaleDateString()} -{' '}
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Resets In</p>
                      <p className="text-sm font-medium">{daysUntilReset} days</p>
                    </div>
                  </div>
                </div>

                <Button onClick={() => setUpgradeDialogOpen(true)} className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Overview</CardTitle>
            <CardDescription>Current billing period usage</CardDescription>
          </CardHeader>
          <CardContent>
            {usage && (
              <div className="space-y-6">
                {/* AI Tokens */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">AI Tokens</p>
                        <p className="text-sm text-muted-foreground">
                          For resume parsing, job generation, and matching
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {usage.ai_tokens_used.toLocaleString()} /{' '}
                        {usage.ai_tokens_limit.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {usage.ai_tokens_remaining.toLocaleString()} remaining
                      </p>
                    </div>
                  </div>
                  <Progress value={getUsagePercentage('ai_tokens')} className="h-3" />
                </div>

                {/* Email Credits */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Email Credits</p>
                        <p className="text-sm text-muted-foreground">
                          For candidate and bulk email sending
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {usage.email_credits_used.toLocaleString()} /{' '}
                        {usage.email_credits_limit.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {usage.email_credits_remaining.toLocaleString()} remaining
                      </p>
                    </div>
                  </div>
                  <Progress value={getUsagePercentage('email_credits')} className="h-3" />
                </div>

                {/* Storage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Storage</p>
                        <p className="text-sm text-muted-foreground">
                          For resumes and documents
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {formatBytes(usage.storage_bytes_used)} /{' '}
                        {formatBytes(usage.storage_bytes_limit)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatBytes(usage.storage_bytes_remaining)} remaining
                      </p>
                    </div>
                  </div>
                  <Progress value={getUsagePercentage('storage')} className="h-3" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Compare plans and features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans?.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-4 ${
                    subscription?.plan_id === plan.id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold">{plan.name}</h4>
                      {subscription?.plan_id === plan.id && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold">{formatPrice(plan.price_monthly)}</p>
                    <p className="text-xs text-muted-foreground">per month</p>
                    
                    <ul className="space-y-1 text-sm">
                      <li>{plan.ai_tokens_monthly.toLocaleString()} AI tokens</li>
                      <li>{plan.email_credits_monthly.toLocaleString()} emails</li>
                      <li>{plan.storage_gb}GB storage</li>
                      <li>
                        {plan.team_members_limit === 999999
                          ? 'Unlimited'
                          : plan.team_members_limit}{' '}
                        team members
                      </li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <PlanUpgradeDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />
    </DashboardLayout>
  );
}
