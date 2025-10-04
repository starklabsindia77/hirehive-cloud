import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useJobs } from '@/hooks/useJobs';
import { useCandidates } from '@/hooks/useCandidates';
import { useApplications } from '@/hooks/useApplications';
import { useInterviews } from '@/hooks/useInterviews';
import { Loader2, TrendingUp, TrendingDown, Calendar, Clock, Users, Target, Award, Activity } from 'lucide-react';
import { DashboardCharts } from '@/components/DashboardCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportReportDialog } from '@/components/ExportReportDialog';

export default function Analytics() {
  const { jobs, loading: jobsLoading } = useJobs();
  const { candidates, loading: candidatesLoading } = useCandidates();
  const { applications, loading: applicationsLoading } = useApplications();
  const { interviews, loading: interviewsLoading } = useInterviews();

  const loading = jobsLoading || candidatesLoading || applicationsLoading || interviewsLoading;

  // Calculate key metrics
  const calculateMetrics = () => {
    // Time to hire (average days from applied to hired)
    const hiredApps = applications.filter(a => a.stage === 'hired');
    const timeToHire = hiredApps.length > 0
      ? Math.round(
          hiredApps.reduce((sum, app) => {
            const applied = new Date(app.applied_at);
            const updated = new Date(app.updated_at);
            return sum + (updated.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / hiredApps.length
        )
      : 0;

    // Offer acceptance rate
    const offersExtended = applications.filter(a => a.stage === 'offer' || a.stage === 'hired').length;
    const offersAccepted = applications.filter(a => a.stage === 'hired').length;
    const acceptanceRate = offersExtended > 0 ? Math.round((offersAccepted / offersExtended) * 100) : 0;

    // Interview to hire ratio
    const interviewStage = applications.filter(a => ['interview', 'offer', 'hired'].includes(a.stage)).length;
    const interviewToHireRate = interviewStage > 0 ? Math.round((offersAccepted / interviewStage) * 100) : 0;

    // Active candidates (not hired or rejected)
    const activeCandidatesCount = applications.filter(a => !['hired', 'rejected'].includes(a.stage)).length;

    // Applications this month
    const thisMonth = applications.filter(a => {
      const appDate = new Date(a.applied_at);
      const now = new Date();
      return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
    }).length;

    // Last month for comparison
    const lastMonth = applications.filter(a => {
      const appDate = new Date(a.applied_at);
      const now = new Date();
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return appDate.getMonth() === lastMonthDate.getMonth() && appDate.getFullYear() === lastMonthDate.getFullYear();
    }).length;

    const monthlyGrowth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

    // Source effectiveness (which jobs get most applications)
    const jobApplications = jobs.map(job => ({
      job: job.title,
      count: applications.filter(a => a.job_id === job.id).length,
      hires: applications.filter(a => a.job_id === job.id && a.stage === 'hired').length
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Quality score (hired / interviewed)
    const qualityScore = interviewStage > 0 ? Math.round((offersAccepted / interviewStage) * 100) : 0;

    // Upcoming interviews
    const upcomingInterviews = interviews.filter(i => {
      const scheduledDate = new Date(i.scheduled_at);
      const now = new Date();
      return scheduledDate > now && i.status === 'scheduled';
    }).length;

    return {
      timeToHire,
      acceptanceRate,
      interviewToHireRate,
      activeCandidatesCount,
      thisMonth,
      monthlyGrowth,
      jobApplications,
      qualityScore,
      upcomingInterviews
    };
  };

  const metrics = loading ? null : calculateMetrics();

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Insights</h1>
          <p className="text-muted-foreground">Deep dive into your recruitment performance and trends</p>
        </div>
        <ExportReportDialog 
          candidates={candidates}
          jobs={jobs}
          applications={applications}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Time to Hire
                </CardTitle>
                <Clock className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{metrics?.timeToHire} days</div>
                <p className="text-sm text-muted-foreground mt-1">Average hiring time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Acceptance Rate
                </CardTitle>
                <Award className="w-5 h-5 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{metrics?.acceptanceRate}%</div>
                <p className="text-sm text-muted-foreground mt-1">Offer acceptance rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Pipeline
                </CardTitle>
                <Users className="w-5 h-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{metrics?.activeCandidatesCount}</div>
                <p className="text-sm text-muted-foreground mt-1">Candidates in process</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  This Month
                </CardTitle>
                {metrics && metrics.monthlyGrowth >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-success" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{metrics?.thisMonth}</div>
                <p className={`text-sm mt-1 ${metrics && metrics.monthlyGrowth >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {metrics && metrics.monthlyGrowth >= 0 ? '+' : ''}{metrics?.monthlyGrowth}% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <DashboardCharts 
            applications={applications}
            jobs={jobs}
            candidates={candidates}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Positions</CardTitle>
                <CardDescription>Jobs with most applications and hires</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.jobApplications.map((job, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{job.job}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.count} applications • {job.hires} hired
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {job.count > 0 ? Math.round((job.hires / job.count) * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Success rate</p>
                      </div>
                    </div>
                  ))}
                  {metrics?.jobApplications.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No data available yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Conversion Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Metrics</CardTitle>
                <CardDescription>Pipeline efficiency indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Interview to Hire Rate</span>
                      <span className="text-sm font-bold">{metrics?.interviewToHireRate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${metrics?.interviewToHireRate}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Quality Score</span>
                      <span className="text-sm font-bold">{metrics?.qualityScore}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full transition-all"
                        style={{ width: `${metrics?.qualityScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10">
                      <Calendar className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">{metrics?.upcomingInterviews} Upcoming Interviews</p>
                        <p className="text-sm text-muted-foreground">Scheduled in the coming days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Candidate Quality
                </CardTitle>
                <Target className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{metrics?.qualityScore}%</div>
                <p className="text-sm text-muted-foreground mt-1">Hired from interviewed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Process Efficiency
                </CardTitle>
                <Activity className="w-5 h-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{metrics?.timeToHire} days</div>
                <p className="text-sm text-muted-foreground mt-1">Average time to hire</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Offer Success
                </CardTitle>
                <Award className="w-5 h-5 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{metrics?.acceptanceRate}%</div>
                <p className="text-sm text-muted-foreground mt-1">Offers accepted</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quality Insights</CardTitle>
              <CardDescription>AI-powered recommendations to improve your hiring process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics && metrics.timeToHire > 30 && (
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-warning mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Time to Hire Can Be Improved</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your average time to hire is {metrics.timeToHire} days. Consider streamlining your interview process or automating repetitive tasks.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {metrics && metrics.acceptanceRate < 70 && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-start gap-3">
                      <TrendingDown className="w-5 h-5 text-destructive mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Low Offer Acceptance Rate</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {metrics.acceptanceRate}% acceptance rate suggests you might need to review compensation packages or improve candidate experience.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {metrics && metrics.interviewToHireRate > 30 && metrics.acceptanceRate > 80 && (
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-success mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Excellent Performance!</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your hiring process is highly efficient with {metrics.interviewToHireRate}% interview-to-hire rate and {metrics.acceptanceRate}% offer acceptance.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {metrics && metrics.monthlyGrowth > 50 && (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">High Growth Detected</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Application volume increased by {metrics.monthlyGrowth}% this month. Consider expanding your recruiting team or automating more tasks.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
