import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Users, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
}

interface RolePermissions {
  role: string;
  permissions: string[];
}

export default function Permissions() {
  const { user } = useAuth();
  const { permissions: userPermissions, loading: permLoading } = usePermissions();
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
    loadRolePermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('resource', { ascending: true })
        .order('action', { ascending: true });

      if (error) throw error;
      setAllPermissions(data || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('role, permission_id');

      if (error) throw error;

      // Group by role
      const grouped: { [key: string]: string[] } = {};
      data?.forEach(rp => {
        if (!grouped[rp.role]) grouped[rp.role] = [];
        grouped[rp.role].push(rp.permission_id);
      });

      setRolePermissions(
        Object.entries(grouped).map(([role, permissions]) => ({
          role,
          permissions
        }))
      );
    } catch (error) {
      console.error('Error loading role permissions:', error);
    }
  };

  const groupPermissionsByResource = () => {
    const grouped: { [key: string]: Permission[] } = {};
    allPermissions.forEach(perm => {
      if (!grouped[perm.resource]) grouped[perm.resource] = [];
      grouped[perm.resource].push(perm);
    });
    return grouped;
  };

  const getRolePermissionCount = (role: string) => {
    const rp = rolePermissions.find(r => r.role === role);
    return rp?.permissions.length || 0;
  };

  if (loading || permLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const groupedPermissions = groupPermissionsByResource();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Permissions Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage role-based permissions and user-specific access controls
          </p>
        </div>

        <Tabs defaultValue="my-permissions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-permissions" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              My Permissions
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Role Permissions
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              All Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Permissions</CardTitle>
                <CardDescription>
                  Permissions granted to you based on your role and any custom overrides
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userPermissions.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No permissions found. Please contact your administrator.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {Object.entries(
                        userPermissions.reduce((acc, perm) => {
                          if (!acc[perm.resource]) acc[perm.resource] = [];
                          acc[perm.resource].push(perm);
                          return acc;
                        }, {} as Record<string, typeof userPermissions>)
                      ).map(([resource, perms]) => (
                        <div key={resource} className="space-y-2">
                          <h3 className="font-semibold text-lg capitalize flex items-center gap-2">
                            {resource.replace('_', ' ')}
                            <Badge variant="secondary">{perms.length}</Badge>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {perms.map(perm => (
                              <div
                                key={`${perm.resource}-${perm.action}`}
                                className="p-3 border rounded-lg bg-muted/50"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium capitalize">
                                    {perm.action.replace('_', ' ')}
                                  </span>
                                  <Badge
                                    variant={
                                      perm.source === 'super_admin'
                                        ? 'default'
                                        : perm.source === 'user_granted'
                                        ? 'secondary'
                                        : 'outline'
                                    }
                                  >
                                    {perm.source === 'super_admin'
                                      ? 'Admin'
                                      : perm.source === 'user_granted'
                                      ? 'Custom'
                                      : 'Role'}
                                  </Badge>
                                </div>
                                {perm.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {perm.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                          <Separator className="mt-4" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {['owner', 'admin', 'recruiter', 'hiring_manager', 'viewer'].map(role => (
                <Card key={role}>
                  <CardHeader>
                    <CardTitle className="capitalize">{role.replace('_', ' ')}</CardTitle>
                    <CardDescription>
                      {getRolePermissionCount(role)} permissions assigned
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="text-lg">
                      {getRolePermissionCount(role)}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All System Permissions</CardTitle>
                <CardDescription>
                  Complete list of all available permissions in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).map(([resource, perms]) => (
                      <div key={resource} className="space-y-3">
                        <h3 className="font-semibold text-lg capitalize flex items-center gap-2">
                          {resource.replace('_', ' ')}
                          <Badge variant="outline">{perms.length}</Badge>
                        </h3>
                        <div className="grid gap-2">
                          {perms.map(perm => (
                            <div
                              key={perm.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <span className="font-medium capitalize">
                                  {perm.action.replace('_', ' ')}
                                </span>
                                {perm.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {perm.description}
                                  </p>
                                )}
                              </div>
                              <Badge variant="secondary">
                                {resource}.{perm.action}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
