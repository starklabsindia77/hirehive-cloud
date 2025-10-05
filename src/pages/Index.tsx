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
  ChevronDown,
  Play,
  DollarSign,
  FileText,
  Lightbulb,
  CheckSquare,
  Layers,
  Globe,
} from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";

const Index = () => {
  const navigate = useNavigate();

  // Redirect to auth if on organization subdomain
  // useEffect(() => {
  //   if (isSubdomain()) {
  //     navigate('/auth');
  //   }
  // }, [navigate]);

  const features = [
    {
      icon: Users,
      title: "Find the Perfect Candidate 3x Faster",
      description:
        "AI-powered matching scores every candidate against your requirements, surfacing top talent instantly.",
      gradient: "from-blue-500 to-cyan-500",
      stat: "3x Faster Hiring",
    },
    {
      icon: BarChart3,
      title: "Never Lose Track of Candidates Again",
      description:
        "Visual pipeline with drag-and-drop simplicity. See your entire hiring process at a glance.",
      gradient: "from-purple-500 to-pink-500",
      stat: "100% Visibility",
    },
    {
      icon: Zap,
      title: "Save 15+ Hours Per Week on Admin",
      description:
        "Automated workflows handle emails, follow-ups, and status updates while you focus on people.",
      gradient: "from-orange-500 to-red-500",
      stat: "15+ Hours Saved",
    },
    {
      icon: Calendar,
      title: "Schedule Interviews in 60 Seconds",
      description:
        "One-click scheduling that syncs with all calendars and handles timezones automatically.",
      gradient: "from-green-500 to-emerald-500",
      stat: "60 Second Setup",
    },
    {
      icon: Target,
      title: "Make Data-Driven Hiring Decisions",
      description:
        "Track every metric that matters. Identify bottlenecks and optimize your process continuously.",
      gradient: "from-indigo-500 to-blue-500",
      stat: "20+ Key Metrics",
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security & Compliance",
      description:
        "SOC 2 Type II certified with GDPR compliance, SSO, and granular permissions for peace of mind.",
      gradient: "from-violet-500 to-purple-500",
      stat: "Bank-Level Security",
    },
  ];

  const companyLogos = [
    { name: "TechCorp", logo: "TC" },
    { name: "StartupXYZ", logo: "SX" },
    { name: "GrowthCo", logo: "GC" },
    { name: "InnovateNow", logo: "IN" },
    { name: "ScaleUp", logo: "SU" },
    { name: "FutureBuilders", logo: "FB" },
  ];

  const comparisonPoints = [
    {
      icon: CheckSquare,
      title: "Built for Modern Teams",
      description: "Intuitive interface that your team will actually use. No weeks of training required.",
    },
    {
      icon: DollarSign,
      title: "Transparent, Affordable Pricing",
      description: "No hidden fees. No per-user charges. Simple pricing that scales with your needs.",
    },
    {
      icon: Zap,
      title: "Setup in Minutes, Not Months",
      description: "Import your candidates and start hiring in under 5 minutes. No consultants needed.",
    },
    {
      icon: Layers,
      title: "All-in-One Platform",
      description: "Everything from sourcing to onboarding in one place. No juggling multiple tools.",
    },
  ];

  const stats = [
    { value: "45%", label: "Faster Time-to-Hire", icon: TrendingUp, subtext: "Average across 500+ companies" },
    { value: "$250K", label: "Annual Savings", icon: DollarSign, subtext: "Per 50 hires" },
    { value: "15hrs", label: "Saved Per Week", icon: Clock, subtext: "On manual tasks" },
    { value: "4.9/5", label: "G2 Rating", icon: Star, subtext: "From 1,200+ reviews" },
  ];

  const testimonials = [
    {
      quote:
        "We reduced time-to-hire by 47% and saved $180K in the first year. NexHire paid for itself in the first quarter.",
      author: "Sarah Johnson",
      role: "Head of Talent",
      company: "TechCorp",
      avatar: "SJ",
      result: "47% faster hiring, $180K saved",
    },
    {
      quote:
        "Finally, an ATS that doesn't require a PhD to use. Our entire team was up and running in 30 minutes.",
      author: "Michael Chen",
      role: "Recruiting Director",
      company: "StartupXYZ",
      avatar: "MC",
      result: "30 min onboarding time",
    },
    {
      quote:
        "The analytics transformed how we hire. We identified our best sources and doubled our quality-of-hire score.",
      author: "Emily Rodriguez",
      role: "VP of People",
      company: "GrowthCo",
      avatar: "ER",
      result: "2x quality-of-hire",
    },
  ];

  return (
    <PublicLayout>
      {/* Navigation */}
      {/* <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
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
            <div className="flex items-center gap-6">
              <Button variant="ghost" asChild className="hidden lg:inline-flex">
                <Link to="/careers" className="flex items-center gap-1">
                  Platform <ChevronDown className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="ghost" asChild className="hidden lg:inline-flex">
                <Link to="/careers" className="flex items-center gap-1">
                  Solutions <ChevronDown className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="ghost" asChild className="hidden lg:inline-flex">
                <Link to="/careers" className="flex items-center gap-1">
                  Resources <ChevronDown className="w-4 h-4" />
                </Link>
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
      </nav> */}

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
              The All-in-One Hiring Platform That{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
                Grows With You
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-fade-up">
              Hire better, faster, and smarter—without the complexity. Modern recruiting software that reduces time-to-hire by 45% and saves $250K annually.
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
                <span>Free 14-day trial • No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                <span>SOC 2 Type II certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span>4.9/5 on G2 (1,200+ reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Logos Section */}
      <section className="py-12 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-wider">
            Trusted by leading companies worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {companyLogos.map((company) => (
              <div
                key={company.name}
                className="flex items-center justify-center w-24 h-24 rounded-lg bg-card border border-border hover:border-primary/50 transition-all group"
              >
                <div className="text-2xl font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  {company.logo}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b border-border bg-gradient-to-br from-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Results That Matter
            </h2>
            <p className="text-lg text-muted-foreground">
              Real outcomes from real companies using NexHire
            </p>
          </div>
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
                  <div className="text-sm font-medium text-foreground">{stat.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.subtext}</div>
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
              Not just features—real outcomes. See exactly how much time and money you'll save.
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
                    <p className="text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <TrendingUp className="w-4 h-4" />
                      {feature.stat}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Demo Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Play className="w-3 h-3 mr-1" />
                See It In Action
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Beautiful, Intuitive Interface
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                No training required. Your team will love using NexHire from day one.
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <Card className="relative border-2 border-primary/20 overflow-hidden bg-card/80 backdrop-blur">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-muted via-background to-muted flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-primary ml-1" />
                      </div>
                      <p className="text-lg text-muted-foreground">Watch Product Demo</p>
                      <p className="text-sm text-muted-foreground mt-2">2 minute overview</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-8">
              {[
                { icon: Zap, label: "Lightning Fast" },
                { icon: Globe, label: "Works Everywhere" },
                { icon: Layers, label: "All-in-One" },
              ].map((item, index) => (
                <Card
                  key={item.label}
                  className="border-border bg-card/50 backdrop-blur animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 text-center">
                    <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
                <Lightbulb className="w-3 h-3 mr-1" />
                Why Choose NexHire
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Modern Hiring, Without the Complexity
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The power of enterprise ATS platforms, with the simplicity of a modern SaaS tool.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {comparisonPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <Card
                    key={point.title}
                    className="border-border hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur animate-fade-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            {point.title}
                          </h3>
                          <p className="text-muted-foreground">{point.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 inline-block">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      <div className="text-left">
                        <div className="text-3xl font-bold text-foreground">4.9/5</div>
                        <div className="text-sm text-muted-foreground">1,200+ G2 Reviews</div>
                      </div>
                    </div>
                    <div className="hidden md:block w-px h-12 bg-border" />
                    <div className="flex items-center gap-2">
                      <Shield className="w-6 h-6 text-primary" />
                      <div className="text-left">
                        <div className="text-3xl font-bold text-foreground">SOC 2</div>
                        <div className="text-sm text-muted-foreground">Type II Certified</div>
                      </div>
                    </div>
                    <div className="hidden md:block w-px h-12 bg-border" />
                    <div className="flex items-center gap-2">
                      <Award className="w-6 h-6 text-accent" />
                      <div className="text-left">
                        <div className="text-3xl font-bold text-foreground">#1</div>
                        <div className="text-sm text-muted-foreground">Ease of Use 2024</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                  <p className="text-muted-foreground mb-4 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="mb-6">
                    <Badge className="bg-success/10 text-success border-success/20">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {testimonial.result}
                    </Badge>
                  </div>
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
      {/* <footer className="border-t border-border py-12 bg-muted/30">
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
      </footer> */}
    </PublicLayout>
  );
};

export default Index;
