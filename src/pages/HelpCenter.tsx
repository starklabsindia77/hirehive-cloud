import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Search, Video, MessageSquare, FileText, Code, HelpCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Lightbulb,
    articles: [
      { title: 'Quick Start Guide', description: 'Get up and running in 5 minutes', url: '#' },
      { title: 'Account Setup', description: 'Configure your organization settings', url: '#' },
      { title: 'First Job Posting', description: 'Create and publish your first job', url: '#' },
      { title: 'Invite Team Members', description: 'Collaborate with your hiring team', url: '#' },
    ]
  },
  {
    id: 'candidates',
    title: 'Candidate Management',
    icon: FileText,
    articles: [
      { title: 'Adding Candidates', description: 'Import and create candidate profiles', url: '#' },
      { title: 'Candidate Pipeline', description: 'Manage candidates through hiring stages', url: '#' },
      { title: 'Resume Parsing', description: 'Automatically extract candidate information', url: '#' },
      { title: 'Candidate Scoring', description: 'Use AI to rank candidates', url: '#' },
    ]
  },
  {
    id: 'workflows',
    title: 'Automation & Workflows',
    icon: Code,
    articles: [
      { title: 'Creating Workflows', description: 'Automate your recruitment process', url: '#' },
      { title: 'Email Sequences', description: 'Set up automated email campaigns', url: '#' },
      { title: 'Zapier Integration', description: 'Connect with 5000+ apps', url: '#' },
      { title: 'Custom Actions', description: 'Build custom automation rules', url: '#' },
    ]
  },
  {
    id: 'interviews',
    title: 'Interviews & Scheduling',
    icon: Video,
    articles: [
      { title: 'Scheduling Interviews', description: 'Book interviews with candidates', url: '#' },
      { title: 'Interview Calendar', description: 'Manage your interview schedule', url: '#' },
      { title: 'Video Interviews', description: 'Conduct remote interviews', url: '#' },
      { title: 'Interview Feedback', description: 'Collect and review interviewer notes', url: '#' },
    ]
  },
];

const faqs = [
  {
    question: 'How do I reset my password?',
    answer: 'Go to Settings > Account > Security and click "Change Password". You\'ll receive an email with instructions.'
  },
  {
    question: 'Can I customize my career page?',
    answer: 'Yes! Navigate to Settings > Organization Branding to customize your logo, colors, and career page content.'
  },
  {
    question: 'How does candidate scoring work?',
    answer: 'Our AI analyzes candidate resumes against job requirements and provides match scores based on skills, experience, and qualifications.'
  },
  {
    question: 'What integrations are available?',
    answer: 'We support Zapier, Make.com, and direct API access. You can connect to thousands of apps including Slack, Gmail, Calendar, and more.'
  },
  {
    question: 'How do I export candidate data?',
    answer: 'Go to Candidates page, select the candidates you want to export, and click "Bulk Actions" > "Export Data". Choose your format (CSV, Excel, or PDF).'
  },
  {
    question: 'Can multiple users interview the same candidate?',
    answer: 'Yes! You can assign multiple interviewers to a candidate and each can leave independent feedback and ratings.'
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Help Center</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about HireHive
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              className="pl-10 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link to="/video-tutorials">
                <Video className="h-4 w-4 mr-2" />
                Video Tutorials
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/api-docs">
                <Code className="h-4 w-4 mr-2" />
                API Documentation
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/community">
                <MessageSquare className="h-4 w-4 mr-2" />
                Community Forum
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/support">
                <HelpCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="documentation" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="documentation" className="space-y-6">
            {searchQuery && filteredCategories.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground text-center">
                    Try searching with different keywords or browse categories below
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {(searchQuery ? filteredCategories : categories).map((category) => {
                  const Icon = category.icon;
                  return (
                    <Card key={category.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <CardTitle>{category.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {category.articles.map((article, idx) => (
                          <a
                            key={idx}
                            href={article.url}
                            className="block p-3 rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="font-medium">{article.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {article.description}
                            </div>
                          </a>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Quick answers to common questions about HireHive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
              <p className="opacity-90">
                Our support team is here to help you succeed
              </p>
            </div>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/support">Contact Support</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
