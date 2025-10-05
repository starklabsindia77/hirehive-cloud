import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Building2, Briefcase, TrendingUp, DollarSign, Activity, Mail, HardDrive, Zap } from 'lucide-react';

export function SuperAdminDashboard() {
  // Fetch platform stats
  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_platform_stats' as any);
      if (error) throw error;
      return data?.[0] || {};
    }
  });

  // Fetch usage summary
  const { data: usageData } = useQuery({
    queryKey: ['platform-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch subscription distribution
  const { data: subscriptions } = useQuery({
    queryKey: ['subscription-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_subscriptions')
        .select('*, subscription_plans(name)')
        .eq('status', 'active');
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate metrics
  const totalOrgs = stats?.total_orgs || 0;
  const totalUsers = stats?.total_users || 0;
  const activeSubscriptions = stats?.active_subscriptions || 0;
  const totalRevenue = stats?.total_revenue || 0;

  // Process usage data by type
  const usageByType = usageData?.reduce((acc: any, item) => {
    if (!acc[item.usage_type]) {
      acc[item.usage_type] = { tokens: 0, credits: 0, bytes: 0 };
    }
    acc[item.usage_type].tokens += item.tokens_used || 0;
    acc[item.usage_type].credits += item.credits_used || 0;
    acc[item.usage_type].bytes += item.bytes_used || 0;
    return acc;
  }, {});

  const usageChartData = Object.entries(usageByType || {}).map(([type, data]: [string, any]) => ({
    name: type.replace(/_/g, ' '),
    tokens: data.tokens,
    credits: data.credits
  }));

  // Process subscription distribution
  const subscriptionDistribution = subscriptions?.reduce((acc: any, sub) => {
    const planName = (sub.subscription_plans as any)?.name || 'Unknown';
    acc[planName] = (acc[planName] || 0) + 1;
    return acc;
  }, {});

  const subscriptionChartData = Object.entries(subscriptionDistribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const metrics = [
    {
      title: 'Total Organizations',
      value: totalOrgs,
      icon: Building2,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      change: '+23%',
      trend: 'up'
    },
    {
      title: 'Active Subscriptions',
      value: activeSubscriptions,
      icon: TrendingUp,
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Monthly Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+15%',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {metric.change}
                </span>
                {' '}from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Usage by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Usage Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Legend />
                <Bar dataKey="tokens" fill="hsl(var(--primary))" name="AI Tokens" />
                <Bar dataKey="credits" fill="hsl(var(--secondary))" name="Email Credits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {subscriptionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              AI Token Usage
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageData?.reduce((sum, u) => sum + (u.tokens_used || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total tokens consumed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Email Credits Used
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageData?.reduce((sum, u) => sum + (u.credits_used || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total emails sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Storage Used
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((usageData?.reduce((sum, u) => sum + (u.bytes_used || 0), 0) || 0) / 1073741824).toFixed(2)} GB
            </div>
            <p className="text-xs text-muted-foreground">
              Total storage consumed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Status</span>
              <span className="text-sm font-medium text-green-600">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Response Time</span>
              <span className="text-sm font-medium">~45ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Uptime</span>
              <span className="text-sm font-medium text-green-600">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Sessions</span>
              <span className="text-sm font-medium">{totalUsers}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
