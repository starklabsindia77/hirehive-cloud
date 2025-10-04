import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isSubdomain } from "@/utils/subdomain";
import {
  Briefcase,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  BarChart3,
  Shield,
  ArrowRight,
  Zap,
  Target,
  Sparkles,
  Award,
  Star,
  Building2,
  MessageSquare,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  // Redirect to auth if on organization subdomain
  useEffect(() => {
    if (isSubdomain()) {
      navigate('/auth');
    }
  }, [navigate]);

  const features = [
    {
      icon: Users,
      title: "Smart Candidate Tracking",
      description:
        "Centralize candidate data with AI-powered matching and automated profile enrichment.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: BarChart3,
      title: "Visual Pipeline",
      description:
        "Drag-and-drop kanban boards with real-time updates and customizable hiring stages.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Workflow Automation",
      description:
        "Eliminate repetitive tasks with intelligent automation and email sequences.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description:
        "Automated interview scheduling with calendar sync and timezone detection.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Target,
      title: "Advanced Analytics",
      description:
        "Deep insights into hiring metrics with customizable reports and dashboards.",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "SOC 2 compliant with role-based access, audit logs, and data encryption.",
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  const stats = [
    { value: "10,000+", label: "Companies", icon: Building2 },
    { value: "500K+", label: "Candidates", icon: Users },
    { value: "98%", label: "Satisfaction", icon: Star },
    { value: "50%", label: "Time Saved", icon: Clock },
  ];

  const testimonials = [
    {
      quote:
        "TalentFlow transformed our hiring process. We reduced time-to-hire by 40% and improved candidate quality significantly.",
      author: "Sarah Johnson",
      role: "Head of Talent",
      company: "TechCorp",
      avatar: "SJ",
    },
    {
      quote:
        "The best ATS we've used. The interface is intuitive, and the automation features save us hours every week.",
      author: "Michael Chen",
      role: "Recruiting Director",
      company: "StartupXYZ",
      avatar: "MC",
    },
    {
      quote:
        "Outstanding platform! The analytics help us make data-driven hiring decisions and continuously improve our process.",
      author: "Emily Rodriguez",
      role: "VP of People",
      company: "GrowthCo",
      avatar: "ER",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                NexHire
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="hidden md:inline-flex">
                <Link to="/careers">Careers</Link>
              </Button>
              <Button variant="ghost" asChild className="hidden md:inline-flex">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                <Link to="/auth" className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--accent)/0.1),transparent_50%)]" />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 text-foreground border-primary/20 hover:border-primary/40 transition-colors animate-fade-in">
              <Sparkles className="w-3 h-3 mr-1" />
              Trusted by 10,000+ Companies
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight animate-fade-up">
              Hire Exceptional Talent,{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
                Faster
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-fade-up">
              The modern ATS platform that combines powerful automation with intelligent insights to
              transform your hiring process.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              <Button size="lg" asChild className="text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl">
                <Link to="/auth" className="flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg border-2 hover:bg-muted/50 transition-colors"
              >
                <Link to="/auth" className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Book a Demo
                </Link>
              </Button>
            </div>

            <div
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-up"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>5-minute setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                <span>SOC 2 certified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-gradient-to-br from-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="text-center group animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-3 flex justify-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Award className="w-3 h-3 mr-1" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Win the War for Talent
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline every step of your recruitment process with intelligent automation and
              data-driven insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-card/50 backdrop-blur animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-8">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              <MessageSquare className="w-3 h-3 mr-1" />
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Loved by Recruitment Teams Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how companies are transforming their hiring with NexHire
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={testimonial.author}
                className="border-border bg-card/80 backdrop-blur hover:shadow-xl transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-background" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "3s" }}
          />
        </div>

        <div className="container mx-auto px-4 relative">
          <Card className="max-w-4xl mx-auto border-2 border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-12 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-glow">
                  <Zap className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Ready to Transform Your Hiring?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of companies using NexHire to build exceptional teams faster and
                smarter.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  asChild
                  className="text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg"
                >
                  <Link to="/auth" className="flex items-center gap-2">
                    Start Your Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-lg border-2 hover:bg-muted/50"
                >
                  <Link to="/auth">Schedule a Demo</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  NexHire
                </span>
                <p className="text-xs text-muted-foreground">Modern ATS Platform</p>
              </div>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link to="/careers" className="hover:text-primary transition-colors">
                Careers
              </Link>
              <Link to="/auth" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link to="/auth" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link to="/auth" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 NexHire. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
