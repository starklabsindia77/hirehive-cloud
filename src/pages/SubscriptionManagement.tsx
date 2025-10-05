import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Search, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SubscriptionManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['all-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_subscriptions')
        .select(`
          *,
          organizations(id, name, brand_name),
          subscription_plans(name, price_monthly, price_yearly)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_subscriptions')
        .select('status, subscription_plans(price_monthly)');
      
      if (error) throw error;

      const activeCount = data.filter(s => s.status === 'active').length;
      const trialCount = data.filter(s => s.status === 'trial').length;
      const cancelledCount = data.filter(s => s.status === 'cancelled').length;
      const totalRevenue = data
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + (s.subscription_plans as any)?.price_monthly || 0, 0);

      return {
        active: activeCount,
        trial: trialCount,
        cancelled: cancelledCount,
        revenue: totalRevenue,
        total: data.length
      };
    }
  });

  const filteredSubscriptions = subscriptions?.filter(sub => {
    const orgName = (sub.organizations as any)?.name || '';
    const brandName = (sub.organizations as any)?.brand_name || '';
    const planName = (sub.subscription_plans as any)?.name || '';
    
    const matchesSearch = orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         planName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      trial: { variant: 'secondary', label: 'Trial' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      past_due: { variant: 'destructive', label: 'Past Due' }
    };
    
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading subscriptions...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CreditCard className="h-8 w-8" />
              Subscription Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor and manage all organization subscriptions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trial</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.trial || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.cancelled || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.revenue.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {/* Subscriptions List */}
        <div className="space-y-4">
          {filteredSubscriptions && filteredSubscriptions.length > 0 ? (
            filteredSubscriptions.map((sub) => {
              const org = sub.organizations as any;
              const plan = sub.subscription_plans as any;
              
              return (
                <Card key={sub.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">
                          {org?.brand_name || org?.name || 'Unknown Organization'}
                        </CardTitle>
                        <CardDescription>
                          Plan: <span className="font-semibold">{plan?.name || 'Unknown'}</span>
                          {' • '}
                          ${plan?.price_monthly || 0}/month
                        </CardDescription>
                      </div>
                      {getStatusBadge(sub.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Started</span>
                        <p className="font-medium">
                          {format(new Date(sub.current_period_start), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Renews</span>
                        <p className="font-medium">
                          {format(new Date(sub.current_period_end), 'MMM d, yyyy')}
                        </p>
                      </div>
                      {sub.trial_ends_at && (
                        <div>
                          <span className="text-muted-foreground">Trial Ends</span>
                          <p className="font-medium">
                            {format(new Date(sub.trial_ends_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      )}
                      {sub.cancelled_at && (
                        <div>
                          <span className="text-muted-foreground">Cancelled</span>
                          <p className="font-medium text-red-600">
                            {format(new Date(sub.cancelled_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No subscriptions found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No subscriptions in the system yet'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
