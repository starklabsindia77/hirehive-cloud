import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Briefcase, Users, BarChart3, Mail, Calendar, 
  FileText, Zap, Shield, Globe, TrendingUp,
  CheckCircle2, Target, Award, Sparkles
} from "lucide-react";

export default function PlatformDocument() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">NexHire Platform Marketing Document</h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive marketing resource for creating content about our ATS platform
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Platform Overview
              </CardTitle>
              <CardDescription>Core information about NexHire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What is NexHire?</h3>
                <p className="text-muted-foreground">
                  NexHire is a modern, intelligent Applicant Tracking System (ATS) that transforms 
                  how companies find, manage, and hire exceptional talent. Built for the modern 
                  workplace, NexHire combines powerful automation, AI-driven insights, and 
                  intuitive design to streamline every step of the recruitment process.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Mission Statement</h3>
                <p className="text-muted-foreground">
                  To empower organizations of all sizes to build better teams by making recruitment 
                  more efficient, data-driven, and human-centered.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Value Proposition</h3>
                <p className="text-muted-foreground">
                  NexHire reduces time-to-hire by up to 50% while improving candidate quality through 
                  AI-powered matching, automated workflows, and collaborative hiring tools—all in a 
                  platform that teams actually love to use.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Key Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">50%</p>
                    <p className="text-sm text-muted-foreground">Faster hiring process</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">10,000+</p>
                    <p className="text-sm text-muted-foreground">Active users</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">95%</p>
                    <p className="text-sm text-muted-foreground">Customer satisfaction</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">24/7</p>
                    <p className="text-sm text-muted-foreground">Support available</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Core Features
              </CardTitle>
              <CardDescription>Comprehensive feature set for modern recruitment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">AI-Powered Candidate Matching</h4>
                      <p className="text-sm text-muted-foreground">
                        Intelligent algorithms analyze resumes and job descriptions to surface the 
                        best candidates automatically, saving hours of manual screening.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">Resume Parsing</Badge>
                        <Badge variant="secondary">Smart Scoring</Badge>
                        <Badge variant="secondary">Skill Matching</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Collaborative Hiring</h4>
                      <p className="text-sm text-muted-foreground">
                        Bring your entire team into the hiring process with shared candidate 
                        profiles, interview feedback, and real-time collaboration tools.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">Team Comments</Badge>
                        <Badge variant="secondary">Scorecards</Badge>
                        <Badge variant="secondary">Activity Feed</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Interview Management</h4>
                      <p className="text-sm text-muted-foreground">
                        Schedule interviews effortlessly with calendar integration, automated 
                        reminders, and panel coordination features.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">Calendar Sync</Badge>
                        <Badge variant="secondary">Auto Reminders</Badge>
                        <Badge variant="secondary">Panel Scheduling</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Automated Communication</h4>
                      <p className="text-sm text-muted-foreground">
                        Keep candidates engaged with personalized email sequences, templates, 
                        and automated follow-ups at every stage.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">Email Templates</Badge>
                        <Badge variant="secondary">Bulk Actions</Badge>
                        <Badge variant="secondary">Sequences</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Advanced Analytics</h4>
                      <p className="text-sm text-muted-foreground">
                        Make data-driven decisions with comprehensive reports on time-to-hire, 
                        source effectiveness, pipeline health, and team performance.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">Real-time Dashboards</Badge>
                        <Badge variant="secondary">Custom Reports</Badge>
                        <Badge variant="secondary">Pipeline Metrics</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Branded Career Pages</h4>
                      <p className="text-sm text-muted-foreground">
                        Create beautiful, customizable career sites that showcase your employer 
                        brand and attract top talent.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">Custom Domains</Badge>
                        <Badge variant="secondary">Brand Customization</Badge>
                        <Badge variant="secondary">Mobile Optimized</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Key Benefits
              </CardTitle>
              <CardDescription>Why organizations choose NexHire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Save Time & Reduce Costs</h4>
                    <p className="text-sm text-muted-foreground">
                      Automate repetitive tasks and reduce time-to-hire by 50%, saving thousands 
                      in recruitment costs per position.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Improve Candidate Quality</h4>
                    <p className="text-sm text-muted-foreground">
                      AI-powered matching ensures you're interviewing the most qualified candidates, 
                      leading to better hires and lower turnover.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Enhance Candidate Experience</h4>
                    <p className="text-sm text-muted-foreground">
                      Provide a modern, transparent application process that keeps candidates engaged 
                      and reflects well on your brand.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Scale Your Hiring</h4>
                    <p className="text-sm text-muted-foreground">
                      Whether you're hiring 10 or 10,000 people, NexHire scales with your needs 
                      without adding complexity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Data-Driven Insights</h4>
                    <p className="text-sm text-muted-foreground">
                      Make informed decisions with real-time analytics and reports that show 
                      what's working and where to improve.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Seamless Collaboration</h4>
                    <p className="text-sm text-muted-foreground">
                      Unite hiring managers, recruiters, and interviewers with tools designed 
                      for teamwork and transparency.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Target Audience
              </CardTitle>
              <CardDescription>Who NexHire serves best</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Growing Companies
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Startups and scale-ups hiring 10-500 employees annually who need powerful 
                    tools without enterprise complexity or cost.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">50-500 employees</Badge>
                    <Badge variant="outline">Tech & SaaS</Badge>
                    <Badge variant="outline">Fast-paced</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    HR Teams
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Talent acquisition professionals seeking to automate workflows, improve 
                    candidate experience, and demonstrate ROI.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">TA Leaders</Badge>
                    <Badge variant="outline">Recruiters</Badge>
                    <Badge variant="outline">HR Managers</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Hiring Managers
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Department leaders who want visibility into their hiring pipeline and tools 
                    to collaborate effectively with HR.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">Department Heads</Badge>
                    <Badge variant="outline">Team Leads</Badge>
                    <Badge variant="outline">Executives</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Recruitment Agencies
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Agencies managing multiple clients who need white-label capabilities and 
                    efficient multi-company workflows.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">Agencies</Badge>
                    <Badge variant="outline">RPO Firms</Badge>
                    <Badge variant="outline">Consultants</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messaging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Marketing Messaging
              </CardTitle>
              <CardDescription>Key messages and positioning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Core Messages</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Primary Message</h4>
                    <p className="text-muted-foreground">
                      "NexHire helps growing companies hire faster and smarter with AI-powered 
                      automation, collaborative tools, and insights that transform recruitment 
                      from a bottleneck into a competitive advantage."
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">For HR Teams</h4>
                    <p className="text-muted-foreground">
                      "Reclaim your time and prove your impact. NexHire automates the busywork 
                      so you can focus on building relationships and making great hires."
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">For Hiring Managers</h4>
                    <p className="text-muted-foreground">
                      "Stop waiting for the right candidate. NexHire brings you qualified talent 
                      faster with transparent workflows and collaborative hiring tools."
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">For Executives</h4>
                    <p className="text-muted-foreground">
                      "Turn hiring into a strategic advantage. NexHire delivers the data and 
                      efficiency you need to build winning teams at scale."
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Differentiators</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Modern, intuitive interface that teams actually want to use</span>
                  </li>
                  <li className="flex gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>AI-powered features that provide real value, not just buzzwords</span>
                  </li>
                  <li className="flex gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Built for collaboration between HR, hiring managers, and teams</span>
                  </li>
                  <li className="flex gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Transparent pricing with no hidden fees or surprise charges</span>
                  </li>
                  <li className="flex gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>White-label capabilities for agencies and multi-brand organizations</span>
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Content Suggestions</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <h4 className="font-medium text-sm mb-1">Blog Topics</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• How to reduce time-to-hire</li>
                      <li>• AI in recruitment best practices</li>
                      <li>• Building a candidate-first process</li>
                      <li>• Collaborative hiring strategies</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded">
                    <h4 className="font-medium text-sm mb-1">Case Study Angles</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• 50% reduction in time-to-hire</li>
                      <li>• Scaling from 10 to 100 employees</li>
                      <li>• Improving candidate quality scores</li>
                      <li>• Enhancing team collaboration</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded">
                    <h4 className="font-medium text-sm mb-1">Social Media</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Feature highlights & tips</li>
                      <li>• Customer success stories</li>
                      <li>• Industry insights & trends</li>
                      <li>• Behind-the-scenes content</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded">
                    <h4 className="font-medium text-sm mb-1">Email Campaigns</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Product updates & new features</li>
                      <li>• Best practice guides</li>
                      <li>• Customer spotlights</li>
                      <li>• Industry benchmarks</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
