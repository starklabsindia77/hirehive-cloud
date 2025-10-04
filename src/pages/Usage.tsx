import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useOrganization } from '@/contexts/OrganizationContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Usage() {
  const { organization } = useOrganization();
  const [periodStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [periodEnd] = useState(new Date());
  
  const { usageBreakdown, usageRecords, isLoading } = useUsageTracking(
    organization?.id,
    periodStart,
    periodEnd
  );

  const getUsageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ai_parse_resume: 'Resume Parsing',
      ai_generate_job_desc: 'Job Generation',
      ai_match_candidates: 'Candidate Matching',
      email_send: 'Email Sent',
      email_bulk_send: 'Bulk Email',
      storage_upload: 'File Upload',
    };
    return labels[type] || type;
  };

  const getUsageTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      ai_parse_resume: 'default',
      ai_generate_job_desc: 'default',
      ai_match_candidates: 'default',
      email_send: 'secondary',
      email_bulk_send: 'secondary',
      storage_upload: 'outline',
    };
    return variants[type] || 'outline';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Usage Details</h1>
          <p className="text-muted-foreground mt-1">
            Detailed breakdown of your resource consumption
          </p>
        </div>

        <Tabs defaultValue="breakdown" className="space-y-4">
          <TabsList>
            <TabsTrigger value="breakdown">Usage Breakdown</TabsTrigger>
            <TabsTrigger value="history">Usage History</TabsTrigger>
          </TabsList>

          {/* Usage Breakdown */}
          <TabsContent value="breakdown" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Usage by Type</CardTitle>
                <CardDescription>
                  Current billing period: {periodStart.toLocaleDateString()} -{' '}
                  {periodEnd.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading usage data...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">AI Tokens</TableHead>
                        <TableHead className="text-right">Email Credits</TableHead>
                        <TableHead className="text-right">Storage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usageBreakdown?.map((usage) => (
                        <TableRow key={usage.usage_type}>
                          <TableCell>
                            <Badge variant={getUsageTypeBadge(usage.usage_type)}>
                              {getUsageTypeLabel(usage.usage_type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{usage.count.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            {usage.total_tokens > 0 ? usage.total_tokens.toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {usage.total_credits > 0 ? usage.total_credits.toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {usage.total_bytes > 0 ? formatBytes(usage.total_bytes) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {usageBreakdown?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No usage data for this period
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Last 100 usage events</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading usage history...</p>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {usageRecords?.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant={getUsageTypeBadge(record.usage_type)}>
                            {getUsageTypeLabel(record.usage_type)}
                          </Badge>
                          <div className="text-sm">
                            <p className="font-medium">
                              {new Date(record.created_at).toLocaleString()}
                            </p>
                            {record.metadata && Object.keys(record.metadata).length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {JSON.stringify(record.metadata)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          {record.tokens_used > 0 && (
                            <p>{record.tokens_used.toLocaleString()} tokens</p>
                          )}
                          {record.credits_used > 0 && (
                            <p>{record.credits_used.toLocaleString()} credits</p>
                          )}
                          {record.bytes_used > 0 && (
                            <p>{formatBytes(record.bytes_used)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {usageRecords?.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No usage history available
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
