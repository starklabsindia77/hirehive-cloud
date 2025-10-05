import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { PublicLayout } from '@/components/PublicLayout';

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'Perfect for small teams and startups',
    features: [
      'Up to 5 active jobs',
      'Up to 3 team members',
      '100 candidates per month',
      'Basic email templates',
      'Standard support',
      'Interview scheduling',
      'Mobile app access',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$149',
    period: '/month',
    description: 'For growing teams with advanced needs',
    features: [
      'Unlimited active jobs',
      'Up to 10 team members',
      '500 candidates per month',
      'Advanced email automation',
      'Priority support',
      'Custom workflows',
      'Analytics & reporting',
      'Resume parsing',
      'API access',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with complex requirements',
    features: [
      'Unlimited everything',
      'Unlimited team members',
      'Unlimited candidates',
      'Dedicated account manager',
      '24/7 premium support',
      'Custom integrations',
      'SSO & advanced security',
      'Custom branding',
      'SLA guarantee',
      'Training & onboarding',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <PublicLayout>
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

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect plan for your hiring needs. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-card border rounded-lg p-8 flex flex-col ${
                plan.highlighted ? 'ring-2 ring-primary shadow-lg scale-105' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="text-center mb-4">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to={plan.name === 'Enterprise' ? '/contact' : '/auth'} className="block">
                <Button
                  className="w-full"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely! All plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, debit cards, and PayPal. Enterprise customers can also pay via invoice.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your subscription at any time. No questions asked, no cancellation fees.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Do you offer discounts for annual billing?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! Save 20% when you choose annual billing. Contact us for more details.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mt-16 bg-card border rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our team is here to help you find the right plan for your organization.
          </p>
          <Link to="/contact">
            <Button size="lg">Contact Sales</Button>
          </Link>
        </section>
      </main>
    </div>
    </PublicLayout>
  );
}
