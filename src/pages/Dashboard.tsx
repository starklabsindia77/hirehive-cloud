import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, Calendar, TrendingUp, Loader2, BarChart3 } from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { useCandidates } from '@/hooks/useCandidates';
import { useApplications } from '@/hooks/useApplications';
import { DashboardCharts } from '@/components/DashboardCharts';
import { UsageWidget } from '@/components/UsageWidget';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { OnboardingWalkthrough } from '@/components/OnboardingWalkthrough';
import { HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { jobs, loading: jobsLoading } = useJobs();
  const { candidates, loading: candidatesLoading } = useCandidates();
  const { applications, loading: applicationsLoading } = useApplications();

  useEffect(() => {
    // Show onboarding on first visit
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const loading = jobsLoading || candidatesLoading || applicationsLoading;

  const openJobs = jobs.filter(j => j.status === 'open').length;
  const activeCandidates = candidates.length;
  const interviewStage = applications.filter(a => a.stage === 'interview').length;
  const thisMonthApplications = applications.filter(a => {
    const appDate = new Date(a.applied_at);
    const now = new Date();
    return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    {
      title: 'Active Candidates',
      value: activeCandidates.toString(),
      change: `${activeCandidates} total`,
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Open Positions',
      value: openJobs.toString(),
      change: `${jobs.length} total jobs`,
      icon: Briefcase,
      color: 'text-accent',
    },
    {
      title: 'In Interview Stage',
      value: interviewStage.toString(),
      change: `${applications.length} total applications`,
      icon: Calendar,
      color: 'text-success',
    },
    {
      title: 'This Month',
      value: thisMonthApplications.toString(),
      change: 'Applications received',
      icon: TrendingUp,
      color: 'text-warning',
    },
  ];

  const recentApplications = applications
    .slice(0, 4)
    .map(app => {
      const candidate = candidates.find(c => c.id === app.candidate_id);
      const job = jobs.find(j => j.id === app.job_id);
      return {
        candidate: candidate?.full_name || 'Unknown',
        position: job?.title || 'Unknown Position',
        status: app.stage,
        time: new Date(app.applied_at).toLocaleDateString(),
      };
    });

  const pipelineData = [
    { stage: 'New Applications', count: applications.filter(a => a.stage === 'screening').length, color: 'bg-primary' },
    { stage: 'Phone Screen', count: applications.filter(a => a.stage === 'phone_screen').length, color: 'bg-accent' },
    { stage: 'Interview', count: applications.filter(a => a.stage === 'interview').length, color: 'bg-success' },
    { stage: 'Offer', count: applications.filter(a => a.stage === 'offer').length, color: 'bg-warning' },
  ];

  const maxCount = Math.max(...pipelineData.map(p => p.count), 1);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your recruitment overview.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowOnboarding(true)} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Quick Tour
          </Button>
          <Button onClick={() => navigate('/analytics')} variant="outline" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </Button>
        </div>
      </div>

      <OnboardingWalkthrough
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={handleOnboardingComplete}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-sm text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Analytics Overview</h2>
        <DashboardCharts 
          applications={applications}
          jobs={jobs}
          candidates={candidates}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((activity, index) => (
                  <div key={index} className="flex items-start justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{activity.candidate}</p>
                      <p className="text-sm text-muted-foreground">{activity.position}</p>
                      <p className="text-sm text-primary mt-1 capitalize">{activity.status.replace('_', ' ')}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineData.map((stage) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{stage.stage}</span>
                    <span className="text-sm font-bold text-foreground">{stage.count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`${stage.color} h-2 rounded-full transition-all`}
                      style={{ width: `${(stage.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <UsageWidget />
      </div>
    </DashboardLayout>
  );
}
