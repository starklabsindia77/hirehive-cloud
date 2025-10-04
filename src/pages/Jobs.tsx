import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Plus } from "lucide-react";

const Jobs = () => {
  const jobs = [
    {
      id: 1,
      title: "Senior Full Stack Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$140k - $180k",
      applicants: 45,
      status: "Active",
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "New York, NY",
      type: "Full-time",
      salary: "$130k - $160k",
      applicants: 38,
      status: "Active",
    },
    {
      id: 3,
      title: "UX Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      salary: "$100k - $130k",
      applicants: 62,
      status: "Active",
    },
    {
      id: 4,
      title: "Data Analyst",
      department: "Analytics",
      location: "Austin, TX",
      type: "Full-time",
      salary: "$90k - $120k",
      applicants: 28,
      status: "Active",
    },
    {
      id: 5,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Seattle, WA",
      type: "Full-time",
      salary: "$120k - $150k",
      applicants: 31,
      status: "Active",
    },
    {
      id: 6,
      title: "Marketing Manager",
      department: "Marketing",
      location: "Boston, MA",
      type: "Full-time",
      salary: "$95k - $125k",
      applicants: 19,
      status: "Active",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Open Positions</h1>
            <p className="text-muted-foreground">Manage and track all your job openings</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Position
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="transition-all hover:shadow-lg group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                      {job.title}
                    </CardTitle>
                    <Badge variant="secondary">{job.department}</Badge>
                  </div>
                  <Badge className="bg-success text-success-foreground">{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {job.type}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    {job.salary}
                  </div>
                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {job.applicants} applicants
                    </span>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Jobs;
