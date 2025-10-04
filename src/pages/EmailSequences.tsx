import { DashboardLayout } from '@/components/DashboardLayout';
import { useEmailSequences } from '@/hooks/useEmailSequences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus, Play, Pause } from 'lucide-react';

export default function EmailSequences() {
  const { sequences, loading } = useEmailSequences();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Email Sequences</h1>
            <p className="text-muted-foreground mt-1">
              Create automated email drip campaigns for candidates
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Sequence
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : sequences.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No email sequences yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first email sequence to nurture candidates
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Sequence
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sequences.map((sequence) => (
              <Card key={sequence.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <CardTitle className="text-lg">{sequence.name}</CardTitle>
                    </div>
                    <Badge variant={sequence.is_active ? 'default' : 'secondary'}>
                      {sequence.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>{sequence.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Steps:</span>
                    <span className="font-medium">{sequence.step_count}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={sequence.is_active ? 'outline' : 'default'}
                      className="flex-1"
                    >
                      {sequence.is_active ? (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
