import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Calendar, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

const Dashboard = () => {
  const stats = [
    {
      title: "Active Candidates",
      value: "248",
      change: "+12%",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Open Positions",
      value: "18",
      change: "+3",
      icon: Briefcase,
      color: "text-accent",
    },
    {
      title: "Interviews Scheduled",
      value: "34",
      change: "+8",
      icon: Calendar,
      color: "text-success",
    },
    {
      title: "Placements This Month",
      value: "12",
      change: "+25%",
      icon: TrendingUp,
      color: "text-warning",
    },
  ];

  const recentActivity = [
    { candidate: "Sarah Johnson", position: "Senior Developer", status: "Interview Scheduled", time: "2 hours ago" },
    { candidate: "Michael Chen", position: "Product Manager", status: "Application Reviewed", time: "4 hours ago" },
    { candidate: "Emily Davis", position: "UX Designer", status: "Offer Sent", time: "1 day ago" },
    { candidate: "James Wilson", position: "Data Analyst", status: "Phone Screen", time: "1 day ago" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your recruitment overview.</p>
      </div>

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
                  <p className="text-sm text-success mt-1">{stat.change} from last month</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{activity.candidate}</p>
                      <p className="text-sm text-muted-foreground">{activity.position}</p>
                      <p className="text-sm text-primary mt-1">{activity.status}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pipeline Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { stage: "New Applications", count: 45, color: "bg-primary" },
                  { stage: "Phone Screen", count: 28, color: "bg-accent" },
                  { stage: "Interview", count: 34, color: "bg-success" },
                  { stage: "Offer", count: 12, color: "bg-warning" },
                ].map((stage) => (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{stage.stage}</span>
                      <span className="text-sm font-bold text-foreground">{stage.count}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`${stage.color} h-2 rounded-full transition-all`}
                        style={{ width: `${(stage.count / 45) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
  );
};

export default Dashboard;
