import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Copy, Check, Key, Book, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const apiEndpoints = [
  {
    method: 'GET',
    path: '/api/v1/candidates',
    description: 'List all candidates',
    parameters: [
      { name: 'page', type: 'integer', required: false, description: 'Page number' },
      { name: 'limit', type: 'integer', required: false, description: 'Results per page' },
      { name: 'stage', type: 'string', required: false, description: 'Filter by stage' },
    ],
    response: `{
  "data": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "stage": "interview",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/candidates',
    description: 'Create a new candidate',
    parameters: [
      { name: 'full_name', type: 'string', required: true, description: 'Candidate full name' },
      { name: 'email', type: 'string', required: true, description: 'Candidate email' },
      { name: 'phone', type: 'string', required: false, description: 'Phone number' },
      { name: 'resume_url', type: 'string', required: false, description: 'Resume URL' },
    ],
    response: `{
  "data": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/jobs',
    description: 'List all job postings',
    parameters: [
      { name: 'status', type: 'string', required: false, description: 'Filter by status (open/closed)' },
      { name: 'department', type: 'string', required: false, description: 'Filter by department' },
    ],
    response: `{
  "data": [
    {
      "id": "uuid",
      "title": "Software Engineer",
      "department": "Engineering",
      "status": "open",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/workflows/execute',
    description: 'Trigger a workflow',
    parameters: [
      { name: 'workflow_id', type: 'string', required: true, description: 'Workflow UUID' },
      { name: 'candidate_id', type: 'string', required: true, description: 'Candidate UUID' },
      { name: 'trigger_data', type: 'object', required: false, description: 'Additional data' },
    ],
    response: `{
  "data": {
    "execution_id": "uuid",
    "status": "running",
    "started_at": "2024-01-01T00:00:00Z"
  }
}`,
  },
];

export default function APIDocs() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: 'Copied!',
      description: 'Code copied to clipboard',
    });
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'default';
      case 'POST': return 'secondary';
      case 'PUT': return 'outline';
      case 'DELETE': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground mt-1">
            Integrate HireHive with your applications
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">API Version</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">v1.0</div>
              <p className="text-xs text-muted-foreground">RESTful API</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Base URL</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono break-all">https://api.hirehive.com</div>
              <p className="text-xs text-muted-foreground mt-1">Production endpoint</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rate Limit</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1000/hr</div>
              <p className="text-xs text-muted-foreground">Per API key</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              All API requests require authentication using an API key
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Getting Your API Key</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Generate an API key from your account settings. Keep it secure and never share it publicly.
              </p>
              <Button>
                <Key className="h-4 w-4 mr-2" />
                Generate API Key
              </Button>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Using Your API Key</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Include your API key in the Authorization header of every request:
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">{`Authorization: Bearer YOUR_API_KEY`}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth')}
                >
                  {copiedCode === 'auth' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Book className="h-6 w-6" />
            API Endpoints
          </h2>

          {apiEndpoints.map((endpoint, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{endpoint.path}</code>
                </div>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="parameters" className="w-full">
                  <TabsList>
                    <TabsTrigger value="parameters">Parameters</TabsTrigger>
                    <TabsTrigger value="response">Response</TabsTrigger>
                    <TabsTrigger value="example">Example</TabsTrigger>
                  </TabsList>

                  <TabsContent value="parameters" className="space-y-4">
                    {endpoint.parameters.length > 0 ? (
                      <div className="space-y-3">
                        {endpoint.parameters.map((param, pidx) => (
                          <div key={pidx} className="border-l-2 border-primary pl-4">
                            <div className="flex items-center gap-2">
                              <code className="font-semibold">{param.name}</code>
                              <Badge variant="outline" className="text-xs">
                                {param.type}
                              </Badge>
                              {param.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {param.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No parameters required</p>
                    )}
                  </TabsContent>

                  <TabsContent value="response">
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <code className="text-sm">{endpoint.response}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(endpoint.response, `response-${idx}`)}
                      >
                        {copiedCode === `response-${idx}` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="example">
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <code className="text-sm">{`curl -X ${endpoint.method} \\
  https://api.hirehive.com${endpoint.path} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(`curl -X ${endpoint.method}...`, `example-${idx}`)}
                      >
                        {copiedCode === `example-${idx}` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Need help with the API?</h3>
              <p className="text-sm text-muted-foreground">
                Contact our developer support team for assistance
              </p>
            </div>
            <Button>Contact Developer Support</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
