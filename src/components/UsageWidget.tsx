import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Link } from 'react-router-dom';
import { AlertCircle, TrendingUp, Zap, Mail, HardDrive } from 'lucide-react';

export function UsageWidget() {
  const { organization } = useOrganization();
  const { usage, subscription, getUsagePercentage } = useSubscription(organization?.id);

  if (!usage || !subscription) return null;

  const aiPercentage = getUsagePercentage('ai_tokens');
  const emailPercentage = getUsagePercentage('email_credits');
  const storagePercentage = getUsagePercentage('storage');

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge variant="destructive">Critical</Badge>;
    if (percentage >= 80) return <Badge variant="outline" className="border-orange-500 text-orange-500">Warning</Badge>;
    return <Badge variant="outline" className="border-green-500 text-green-500">Good</Badge>;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Resource Usage</CardTitle>
        <Link to="/usage">
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Tokens */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>AI Tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {usage.ai_tokens_used.toLocaleString()} / {usage.ai_tokens_limit.toLocaleString()}
              </span>
              {getStatusBadge(aiPercentage)}
            </div>
          </div>
          <Progress value={aiPercentage} className="h-2" />
        </div>

        {/* Email Credits */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>Email Credits</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {usage.email_credits_used.toLocaleString()} / {usage.email_credits_limit.toLocaleString()}
              </span>
              {getStatusBadge(emailPercentage)}
            </div>
          </div>
          <Progress value={emailPercentage} className="h-2" />
        </div>

        {/* Storage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              <span>Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {formatBytes(usage.storage_bytes_used)} / {formatBytes(usage.storage_bytes_limit)}
              </span>
              {getStatusBadge(storagePercentage)}
            </div>
          </div>
          <Progress value={storagePercentage} className="h-2" />
        </div>

        {/* Upgrade CTA if approaching limits */}
        {(aiPercentage >= 80 || emailPercentage >= 80 || storagePercentage >= 80) && (
          <div className="pt-2 border-t">
            <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Approaching Limit
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Consider upgrading to avoid service interruption
                </p>
              </div>
            </div>
            <Link to="/billing">
              <Button className="w-full mt-2" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
          </div>
        )}

        {/* Current Plan */}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          Current Plan: <span className="font-medium text-foreground">{subscription.plan?.name}</span>
          {subscription.status === 'trial' && subscription.trial_ends_at && (
            <span className="ml-2">
              (Trial ends {new Date(subscription.trial_ends_at).toLocaleDateString()})
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
