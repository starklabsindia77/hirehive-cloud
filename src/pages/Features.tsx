import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Users, 
  Briefcase, 
  Calendar, 
  Mail, 
  BarChart3, 
  Workflow, 
  Shield, 
  Search,
  FileText,
  Clock,
  CheckCircle,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Candidate Management',
    description: 'Comprehensive candidate tracking with customizable pipelines, advanced search, and candidate scoring.',
  },
  {
    icon: Briefcase,
    title: 'Job Posting',
    description: 'Create and publish job listings with AI-powered descriptions and multi-channel distribution.',
  },
  {
    icon: Calendar,
    title: 'Interview Scheduling',
    description: 'Streamline interview coordination with calendar integration and automated reminders.',
  },
  {
    icon: Mail,
    title: 'Email Automation',
    description: 'Engage candidates with personalized email sequences and customizable templates.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Gain insights with comprehensive dashboards, custom reports, and performance metrics.',
  },
  {
    icon: Workflow,
    title: 'Automated Workflows',
    description: 'Automate repetitive tasks with custom workflows and trigger-based actions.',
  },
  {
    icon: Shield,
    title: 'Permissions & Security',
    description: 'Role-based access control, SSO integration, and enterprise-grade security.',
  },
  {
    icon: Search,
    title: 'Advanced Search',
    description: 'Find the perfect candidates with powerful filters, boolean search, and AI matching.',
  },
  {
    icon: FileText,
    title: 'Resume Parsing',
    description: 'Automatically extract and structure candidate information from resumes.',
  },
  {
    icon: Clock,
    title: 'Real-time Collaboration',
    description: 'Work together with your team through comments, notes, and activity feeds.',
  },
  {
    icon: CheckCircle,
    title: 'Offer Management',
    description: 'Generate, customize, and track offer letters with electronic signatures.',
  },
  {
    icon: Zap,
    title: 'Integrations',
    description: 'Connect with your favorite tools through our extensive integration ecosystem.',
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Platform Features</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to streamline your recruitment process and hire top talent faster.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Detailed Features */}
        <section className="space-y-16 mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">AI-Powered Matching</h2>
              <p className="text-muted-foreground mb-4">
                Our intelligent matching algorithm analyzes job requirements and candidate profiles to surface the best fits automatically.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Automatic candidate scoring based on job criteria</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Skills matching and gap analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Experience and education matching</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-12 h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Smart Candidate Matching</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-lg p-12 h-64 flex items-center justify-center">
              <div className="text-center">
                <Users className="h-16 w-16 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Team Collaboration</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-4">Seamless Team Collaboration</h2>
              <p className="text-muted-foreground mb-4">
                Keep your entire hiring team aligned with built-in collaboration tools and real-time updates.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Shared notes and candidate feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Activity feeds and notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Role-based permissions and access control</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-card border rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience These Features?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start your free trial today and discover how our platform can transform your hiring process.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">Schedule Demo</Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
