import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { CreateCustomPlanDialog } from '@/components/CreateCustomPlanDialog';
import { FeatureToggleDialog } from '@/components/FeatureToggleDialog';
import { OrganizationBrandingDialog } from '@/components/OrganizationBrandingDialog';
import { PlatformBrandingDialog } from '@/components/PlatformBrandingDialog';
import { Building2, Search, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

export default function SuperAdmin() {
  const { organizations, loadingOrgs } = useSuperAdmin();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrgs = organizations?.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.schema_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingOrgs) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading organizations...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Super Admin Panel</h1>
            <p className="text-muted-foreground mt-2">
              Manage organizations, features, and create custom enterprise plans
            </p>
          </div>
          <PlatformBrandingDialog />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search organizations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6">
          {filteredOrgs && filteredOrgs.length > 0 ? (
            filteredOrgs.map((org) => (
              <Card key={org.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {org.logo_url ? (
                        <img
                          src={org.logo_url}
                          alt={org.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: org.primary_color || '#0ea5e9' }}
                        >
                          {org.name[0]}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-xl">
                          {org.brand_name || org.name}
                        </CardTitle>
                        <div className="space-y-1 mt-1">
                          <p className="text-sm text-muted-foreground">
                            Schema: {org.schema_name}
                          </p>
                          {org.subdomain && (
                            <p className="text-sm text-muted-foreground">
                              Subdomain: <span className="font-medium">{org.subdomain}.yourdomain.com</span>
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Created {format(new Date(org.created_at), 'MMM d, yyyy')}
                          </div>
                          {org.plan_name && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {org.plan_name} (${org.plan_price}/mo)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <OrganizationBrandingDialog
                        organizationId={org.id}
                        organizationName={org.brand_name || org.name}
                        currentLogoUrl={org.logo_url}
                        currentHeaderCode={org.custom_header_code}
                        currentFooterCode={org.custom_footer_code}
                      />
                      <FeatureToggleDialog
                        organizationId={org.id}
                        organizationName={org.brand_name || org.name}
                      />
                      <CreateCustomPlanDialog
                        organizationId={org.id}
                        organizationName={org.brand_name || org.name}
                      />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm ? 'Try a different search term' : 'No organizations in the system yet'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
