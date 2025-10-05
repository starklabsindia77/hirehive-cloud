import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Plus, MoreVertical, TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { format } from 'date-fns';

const OrganizationsManagement = () => {
  const navigate = useNavigate();
  const { organizations, loadingOrgs } = useSuperAdmin();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrganizations = organizations?.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.subdomain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: organizations?.length || 0,
    active: organizations?.filter(org => org.current_subscription_id).length || 0,
    inactive: organizations?.filter(org => !org.current_subscription_id).length || 0,
    growth: '+12%'
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Organizations Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage all organizations across the platform
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Organization
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500">{stats.growth}</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">
                With active subscriptions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground mt-1">
                No active subscription
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.growth}</div>
              <p className="text-xs text-muted-foreground mt-1">
                30-day trend
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Organizations Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Organizations</CardTitle>
                <CardDescription>
                  View and manage all organizations on the platform
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingOrgs ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Subdomain</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrganizations && filteredOrganizations.length > 0 ? (
                      filteredOrganizations.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {org.logo_url ? (
                                <img
                                  src={org.logo_url}
                                  alt={org.name}
                                  className="h-8 w-8 rounded object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{org.name}</div>
                                {org.brand_name && (
                                  <div className="text-xs text-muted-foreground">
                                    {org.brand_name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {org.subdomain ? (
                              <Badge variant="secondary">{org.subdomain}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {org.plan_name ? (
                              <div>
                                <div className="font-medium">{org.plan_name}</div>
                                {org.plan_price && (
                                  <div className="text-xs text-muted-foreground">
                                    ${org.plan_price}/mo
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No plan</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {org.current_subscription_id ? (
                              <Badge variant="default" className="bg-green-500">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(org.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Settings</DropdownMenuItem>
                                <DropdownMenuItem>Manage Subscription</DropdownMenuItem>
                                <DropdownMenuItem>View Usage</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Suspend Organization
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No organizations found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OrganizationsManagement;
