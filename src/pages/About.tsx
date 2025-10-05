import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, Users, Zap, Shield } from 'lucide-react';

export default function About() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Our Platform</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Revolutionizing recruitment with intelligent automation and seamless collaboration tools for modern hiring teams.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-card border rounded-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4 text-center">Our Mission</h2>
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
              We empower organizations to build exceptional teams by streamlining the entire recruitment process—from sourcing to onboarding—with powerful, intuitive tools that save time and improve hiring outcomes.
            </p>
          </div>
        </section>

        {/* Values Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Innovation</h3>
              <p className="text-sm text-muted-foreground">
                Continuously improving with cutting-edge technology
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Fostering teamwork and seamless communication
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Efficiency</h3>
              <p className="text-sm text-muted-foreground">
                Automating workflows to save valuable time
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Security</h3>
              <p className="text-sm text-muted-foreground">
                Protecting your data with enterprise-grade security
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded by a team of HR professionals and technologists, our platform was born from firsthand experience with the challenges of modern recruitment.
                </p>
                <p>
                  We recognized that traditional hiring processes were inefficient, fragmented, and often frustrating for both recruiters and candidates. That's why we set out to create a comprehensive solution that addresses every stage of the recruitment lifecycle.
                </p>
                <p>
                  Today, we serve organizations of all sizes—from startups to enterprises—helping them attract, evaluate, and onboard top talent with unprecedented speed and accuracy.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-12 text-center">
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Organizations</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">500K+</div>
                  <div className="text-sm text-muted-foreground">Candidates Hired</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">95%</div>
                  <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-card border rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Hiring?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of organizations already using our platform to build better teams.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">Contact Sales</Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
