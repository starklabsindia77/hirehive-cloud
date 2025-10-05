import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Activity, Zap, Mail, HardDrive, Users, Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, subDays } from 'date-fns';

export default function PlatformAnalytics() {
  const { data: usageData } = useQuery({
    queryKey: ['platform-usage-analytics'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const { data, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: orgGrowth } = useQuery({
    queryKey: ['organization-growth'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('created_at')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Process usage data by day
  const usageByDay = usageData?.reduce((acc: any, item) => {
    const day = format(new Date(item.created_at), 'MMM dd');
    if (!acc[day]) {
      acc[day] = { day, tokens: 0, credits: 0, bytes: 0 };
    }
    acc[day].tokens += item.tokens_used || 0;
    acc[day].credits += item.credits_used || 0;
    acc[day].bytes += item.bytes_used || 0;
    return acc;
  }, {});

  const dailyUsageData = Object.values(usageByDay || {});

  // Process usage by type
  const usageByType = usageData?.reduce((acc: any, item) => {
    if (!acc[item.usage_type]) {
      acc[item.usage_type] = { count: 0, tokens: 0, credits: 0, bytes: 0 };
    }
    acc[item.usage_type].count += 1;
    acc[item.usage_type].tokens += item.tokens_used || 0;
    acc[item.usage_type].credits += item.credits_used || 0;
    acc[item.usage_type].bytes += item.bytes_used || 0;
    return acc;
  }, {});

  const typeDistribution = Object.entries(usageByType || {}).map(([type, data]: [string, any]) => ({
    name: type.replace(/_/g, ' '),
    value: data.count
  }));

  // Organization growth by month
  const orgsByMonth = orgGrowth?.reduce((acc: any, org) => {
    const month = format(new Date(org.created_at), 'MMM yyyy');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const growthData = Object.entries(orgsByMonth || {}).map(([month, count]) => ({
    month,
    organizations: count
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

  // Calculate totals
  const totalTokens = usageData?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0;
  const totalCredits = usageData?.reduce((sum, u) => sum + (u.credits_used || 0), 0) || 0;
  const totalBytes = usageData?.reduce((sum, u) => sum + (u.bytes_used || 0), 0) || 0;
  const totalOrgs = orgGrowth?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="h-8 w-8" />
              Platform Analytics
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive usage and growth analytics
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrgs}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Tokens Used</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email Credits</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCredits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(totalBytes / 1073741824).toFixed(2)} GB
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList>
            <TabsTrigger value="usage">Usage Trends</TabsTrigger>
            <TabsTrigger value="distribution">Type Distribution</TabsTrigger>
            <TabsTrigger value="growth">Organization Growth</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Usage Overview (Last 30 Days)</CardTitle>
                <CardDescription>AI tokens and email credits consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={dailyUsageData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))'
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="tokens"
                      stackId="1"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                      name="AI Tokens"
                    />
                    <Area
                      type="monotone"
                      dataKey="credits"
                      stackId="2"
                      stroke="hsl(var(--secondary))"
                      fill="hsl(var(--secondary))"
                      fillOpacity={0.6}
                      name="Email Credits"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Usage by Type</CardTitle>
                  <CardDescription>Distribution of different usage types</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={typeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                      >
                        {typeDistribution.map((entry, index) => (
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

              <Card>
                <CardHeader>
                  <CardTitle>Resource Breakdown</CardTitle>
                  <CardDescription>Total consumption by resource type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={Object.entries(usageByType || {}).map(([type, data]: [string, any]) => ({
                        name: type.replace(/_/g, ' '),
                        tokens: data.tokens,
                        credits: data.credits
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={100} />
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
            </div>
          </TabsContent>

          <TabsContent value="growth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Growth</CardTitle>
                <CardDescription>New organizations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="organizations"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="New Organizations"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
