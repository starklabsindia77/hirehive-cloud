import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Key, Edit, Trash2, Eye, EyeOff, ShieldCheck, ShieldX } from 'lucide-react';
import { usePlatformSecrets } from '@/hooks/usePlatformSecrets';
import { PlatformSecretsDialog } from '@/components/PlatformSecretsDialog';
import { format } from 'date-fns';

export default function PlatformSecrets() {
  const { secrets, isLoading, deleteSecret, toggleSecretStatus } = usePlatformSecrets();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSecret.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Key className="h-8 w-8" />
              Platform Secrets Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Securely manage API keys and secrets for platform integrations
            </p>
          </div>
          <PlatformSecretsDialog />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Keys & Secrets</CardTitle>
            <CardDescription>
              All secrets are stored encrypted and only accessible by super admins
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading secrets...</div>
            ) : !secrets || secrets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No secrets configured yet
              </div>
            ) : (
              <div className="space-y-4">
                {secrets.map((secret) => (
                  <div
                    key={secret.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{secret.key_name}</h3>
                        <Badge variant={secret.is_active ? 'default' : 'secondary'}>
                          {secret.is_active ? (
                            <>
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <ShieldX className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </div>
                      {secret.description && (
                        <p className="text-sm text-muted-foreground">{secret.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          Updated: {format(new Date(secret.updated_at), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {visibleSecrets.has(secret.id)
                            ? secret.key_value || '(empty)'
                            : '••••••••••••••••'}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleSecretVisibility(secret.id)}
                        >
                          {visibleSecrets.has(secret.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toggleSecretStatus.mutate({
                            id: secret.id,
                            isActive: !secret.is_active,
                          })
                        }
                      >
                        {secret.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <PlatformSecretsDialog
                        secret={secret}
                        trigger={
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteId(secret.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Secret?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Edge functions using this secret will fail until a
                new value is provided.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
