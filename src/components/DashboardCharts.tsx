import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Application } from '@/hooks/useApplications';
import { Job } from '@/hooks/useJobs';
import { Candidate } from '@/hooks/useCandidates';

interface DashboardChartsProps {
  applications: Application[];
  jobs: Job[];
  candidates: Candidate[];
}

export function DashboardCharts({ applications, jobs, candidates }: DashboardChartsProps) {
  // Applications over time (last 6 months)
  const getApplicationsOverTime = () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        applications: 0
      };
    });

    applications.forEach(app => {
      const appDate = new Date(app.applied_at);
      const now = new Date();
      const monthsDiff = (now.getFullYear() - appDate.getFullYear()) * 12 + (now.getMonth() - appDate.getMonth());
      
      if (monthsDiff < 6) {
        const index = 5 - monthsDiff;
        if (index >= 0 && index < 6) {
          last6Months[index].applications++;
        }
      }
    });

    return last6Months;
  };

  // Stage distribution
  const getStageDistribution = () => {
    const stages = ['screening', 'phone_screen', 'interview', 'offer', 'hired', 'rejected'];
    const distribution = stages.map(stage => ({
      name: stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: applications.filter(a => a.stage === stage).length
    })).filter(s => s.value > 0);

    return distribution;
  };

  // Source distribution (by department)
  const getSourceDistribution = () => {
    const departments = new Map<string, number>();
    
    applications.forEach(app => {
      const job = jobs.find(j => j.id === app.job_id);
      if (job?.department) {
        departments.set(job.department, (departments.get(job.department) || 0) + 1);
      }
    });

    return Array.from(departments.entries()).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Conversion funnel
  const getConversionFunnel = () => {
    const total = applications.length;
    const phoneScreen = applications.filter(a => ['phone_screen', 'interview', 'offer', 'hired'].includes(a.stage)).length;
    const interview = applications.filter(a => ['interview', 'offer', 'hired'].includes(a.stage)).length;
    const offer = applications.filter(a => ['offer', 'hired'].includes(a.stage)).length;
    const hired = applications.filter(a => a.stage === 'hired').length;

    return [
      { stage: 'Applied', count: total, conversion: 100 },
      { stage: 'Phone Screen', count: phoneScreen, conversion: total ? Math.round((phoneScreen / total) * 100) : 0 },
      { stage: 'Interview', count: interview, conversion: total ? Math.round((interview / total) * 100) : 0 },
      { stage: 'Offer', count: offer, conversion: total ? Math.round((offer / total) * 100) : 0 },
      { stage: 'Hired', count: hired, conversion: total ? Math.round((hired / total) * 100) : 0 },
    ];
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  const applicationsOverTime = getApplicationsOverTime();
  const stageDistribution = getStageDistribution();
  const sourceDistribution = getSourceDistribution();
  const conversionFunnel = getConversionFunnel();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Applications Over Time */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Applications Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={applicationsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="applications" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Applications"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stage Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Stage Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stageDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {stageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Source Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Applications by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--accent))" name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Hiring Funnel & Conversion Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionFunnel} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="stage" type="category" stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'count') return [value, 'Candidates'];
                  if (name === 'conversion') return [value + '%', 'Conversion Rate'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--primary))" name="Candidates" />
              <Bar dataKey="conversion" fill="hsl(var(--success))" name="Conversion %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
