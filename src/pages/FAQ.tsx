import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqCategories = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'How do I create an account?',
        answer: 'Click the "Get Started" button on our homepage and follow the registration process. You\'ll need to provide your email, create a password, and set up your organization profile.',
      },
      {
        question: 'Is there a free trial available?',
        answer: 'Yes! We offer a 14-day free trial on all plans. No credit card is required to start your trial.',
      },
      {
        question: 'How long does it take to set up?',
        answer: 'Most organizations are up and running within 15 minutes. Our guided onboarding process helps you configure your account, add team members, and post your first job quickly.',
      },
    ],
  },
  {
    category: 'Features & Functionality',
    questions: [
      {
        question: 'Can I customize the recruitment pipeline?',
        answer: 'Absolutely! You can create custom stages, define your own workflow, and set up automated actions at each stage of your recruitment process.',
      },
      {
        question: 'Does the platform support resume parsing?',
        answer: 'Yes, our AI-powered resume parser automatically extracts candidate information from uploaded resumes and CVs, saving you hours of manual data entry.',
      },
      {
        question: 'Can I schedule interviews directly through the platform?',
        answer: 'Yes! Our interview scheduling feature integrates with popular calendar systems and allows you to send availability to candidates, who can then book their own interview slots.',
      },
      {
        question: 'What kind of reports and analytics are available?',
        answer: 'We provide comprehensive analytics including time-to-hire, source effectiveness, pipeline conversion rates, team performance metrics, and custom report builders.',
      },
    ],
  },
  {
    category: 'Collaboration & Teams',
    questions: [
      {
        question: 'How many team members can I add?',
        answer: 'This depends on your plan. Starter plans support up to 3 team members, Professional plans up to 10, and Enterprise plans have no limits.',
      },
      {
        question: 'Can I control what team members can see and do?',
        answer: 'Yes! Our role-based permissions system lets you define exactly what each team member can access and modify. You can create custom roles or use our predefined ones.',
      },
      {
        question: 'How do team members collaborate on candidates?',
        answer: 'Team members can leave comments, share notes, rate candidates, and see all activity in real-time through our collaboration features.',
      },
    ],
  },
  {
    category: 'Security & Compliance',
    questions: [
      {
        question: 'Is my data secure?',
        answer: 'Yes, we take security very seriously. We use enterprise-grade encryption, regular security audits, and comply with GDPR, SOC 2, and other major security standards.',
      },
      {
        question: 'Do you support Single Sign-On (SSO)?',
        answer: 'Yes, Enterprise plans include SSO integration with providers like Okta, Azure AD, and Google Workspace.',
      },
      {
        question: 'Where is my data stored?',
        answer: 'Data is stored in secure, redundant data centers with automatic backups. You can choose your preferred data region during setup.',
      },
    ],
  },
  {
    category: 'Billing & Pricing',
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and PayPal. Enterprise customers can also pay via invoice.',
      },
      {
        question: 'Can I change my plan later?',
        answer: 'Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades apply at the start of your next billing cycle.',
      },
      {
        question: 'What happens if I exceed my plan limits?',
        answer: 'We\'ll notify you when you\'re approaching your limits. You can either upgrade your plan or we\'ll work with you to find the best solution.',
      },
      {
        question: 'Do you offer refunds?',
        answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied with our platform, contact us within 30 days for a full refund.',
      },
    ],
  },
  {
    category: 'Support',
    questions: [
      {
        question: 'What kind of support do you offer?',
        answer: 'All plans include email support. Professional plans get priority support, and Enterprise plans include 24/7 phone support and a dedicated account manager.',
      },
      {
        question: 'Do you offer training?',
        answer: 'Yes! We provide video tutorials, documentation, and webinars for all customers. Enterprise customers receive personalized onboarding and training sessions.',
      },
      {
        question: 'How quickly can I expect a response?',
        answer: 'Starter plan: within 24 hours. Professional plan: within 12 hours. Enterprise plan: within 2 hours (24/7 for critical issues).',
      },
    ],
  },
];

export default function FAQ() {
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

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about our recruitment platform.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((item, questionIndex) => (
                  <AccordionItem key={questionIndex} value={`${categoryIndex}-${questionIndex}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <section className="text-center mt-16 bg-card border rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <Link to="/contact">
            <Button size="lg">Contact Support</Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
