import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, MessageSquare, Clock, CheckCircle2, Mail, Phone, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const supportTiers = [
  {
    name: 'Free',
    price: '$0',
    features: [
      'Email support (48h response)',
      'Community forum access',
      'Basic documentation',
      'Self-service knowledge base',
    ],
    responseTime: '48 hours',
    icon: Mail,
  },
  {
    name: 'Professional',
    price: '$49/mo',
    features: [
      'Priority email support (24h)',
      'Live chat support',
      'Video call support',
      'Dedicated support agent',
      'Advanced documentation',
    ],
    responseTime: '24 hours',
    icon: MessageCircle,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      '24/7 priority support',
      'Dedicated account manager',
      'Custom SLA agreements',
      'Onboarding assistance',
      'Priority bug fixes',
      'Training sessions',
    ],
    responseTime: '4 hours',
    icon: Phone,
  },
];

const existingTickets = [
  {
    id: '#TKT-1234',
    subject: 'Unable to parse PDF resumes',
    status: 'In Progress',
    priority: 'High',
    created: '2 hours ago',
    updated: '30 mins ago',
  },
  {
    id: '#TKT-1189',
    subject: 'Email template variables not working',
    status: 'Resolved',
    priority: 'Medium',
    created: '2 days ago',
    updated: '1 day ago',
  },
  {
    id: '#TKT-1156',
    subject: 'Question about billing',
    status: 'Waiting on Customer',
    priority: 'Low',
    created: '5 days ago',
    updated: '3 days ago',
  },
];

export default function Support() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Support ticket created',
        description: 'Our team will respond within 24 hours',
      });
      setSubject('');
      setDescription('');
      setPriority('');
      setCategory('');
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'default';
      case 'Resolved': return 'secondary';
      case 'Waiting on Customer': return 'outline';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Support Center</h1>
          <p className="text-muted-foreground mt-1">
            Get help when you need it
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {supportTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card key={tier.name} className={tier.popular ? 'border-primary shadow-md' : ''}>
                {tier.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium rounded-t-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className="h-8 w-8 text-primary" />
                    <div className="text-right">
                      <div className="text-2xl font-bold">{tier.price}</div>
                      {tier.price !== 'Custom' && <div className="text-sm text-muted-foreground">per month</div>}
                    </div>
                  </div>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>
                    Response time: <strong>{tier.responseTime}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant={tier.popular ? 'default' : 'outline'}>
                    {tier.price === 'Custom' ? 'Contact Sales' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="new">New Ticket</TabsTrigger>
            <TabsTrigger value="existing">My Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
                <CardDescription>
                  Describe your issue and our team will help you resolve it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="account">Account</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority *</Label>
                      <Select value={priority} onValueChange={setPriority} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide detailed information about your issue..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="existing" className="space-y-4">
            {existingTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold">{ticket.id}</span>
                        <Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                        <Badge variant={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                      </div>
                      <h3 className="font-semibold">{ticket.subject}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Created {ticket.created}
                        </div>
                        <div>Updated {ticket.updated}</div>
                      </div>
                    </div>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <Card className="bg-muted">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
            <div className="flex items-center gap-4">
              <HelpCircle className="h-10 w-10 text-primary" />
              <div>
                <h3 className="text-lg font-semibold mb-1">Need immediate help?</h3>
                <p className="text-sm text-muted-foreground">
                  Check our knowledge base or community forum for instant answers
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Knowledge Base</Button>
              <Button variant="outline">Community</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
