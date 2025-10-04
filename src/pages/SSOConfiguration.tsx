import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';

interface SSOConfig {
  id?: string;
  provider: string;
  is_enabled: boolean;
  client_id?: string;
  client_secret?: string;
  force_sso: boolean;
  auto_provision: boolean;
  default_role: string;
}

export default function SSOConfiguration() {
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SSOConfig>({
    provider: 'google',
    is_enabled: false,
    force_sso: false,
    auto_provision: true,
    default_role: 'viewer'
  });

  useEffect(() => {
    loadConfig();
  }, [organization]);

  const loadConfig = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('sso_configurations')
        .select('*')
        .eq('organization_id', organization.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setConfig(data);
    } catch (error) {
      console.error('Error loading SSO config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!organization) return;

    setSaving(true);
    try {
      const configData = {
        organization_id: organization.id,
        ...config
      };

      const { error } = await supabase
        .from('sso_configurations')
        .upsert(configData);

      if (error) throw error;

      toast.success('SSO configuration saved successfully');
    } catch (error: any) {
      console.error('Error saving SSO config:', error);
      toast.error(error.message || 'Failed to save SSO configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            SSO Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure Single Sign-On for your organization
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> To complete SSO setup, you need to configure the OAuth provider in your backend settings (Auth Settings → Providers).
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="google" className="space-y-4">
          <TabsList>
            <TabsTrigger value="google">Google OAuth</TabsTrigger>
            <TabsTrigger value="microsoft">Microsoft</TabsTrigger>
            <TabsTrigger value="okta">Okta/SAML</TabsTrigger>
          </TabsList>

          <TabsContent value="google" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Google OAuth Configuration</CardTitle>
                <CardDescription>
                  Configure Google Workspace SSO for your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="google-enabled">Enable Google SSO</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to sign in with their Google account
                    </p>
                  </div>
                  <Switch
                    id="google-enabled"
                    checked={config.provider === 'google' && config.is_enabled}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, provider: 'google', is_enabled: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google-client-id">Client ID</Label>
                  <Input
                    id="google-client-id"
                    value={config.client_id || ''}
                    onChange={(e) => setConfig({ ...config, client_id: e.target.value })}
                    placeholder="Your Google OAuth Client ID"
                  />
                  <p className="text-sm text-muted-foreground">
                    Get this from Google Cloud Console
                  </p>
                </div>

                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Setup Instructions:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                      <li>Go to Google Cloud Console</li>
                      <li>Enable Google OAuth API</li>
                      <li>Configure OAuth consent screen</li>
                      <li>Create OAuth 2.0 credentials</li>
                      <li>Add authorized redirect URIs</li>
                      <li>Configure in backend settings with Client ID and Secret</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="microsoft" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Microsoft Azure AD Configuration</CardTitle>
                <CardDescription>
                  Configure Microsoft 365/Azure AD SSO
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="microsoft-enabled">Enable Microsoft SSO</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to sign in with Microsoft accounts
                    </p>
                  </div>
                  <Switch
                    id="microsoft-enabled"
                    checked={config.provider === 'microsoft' && config.is_enabled}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, provider: 'microsoft', is_enabled: checked })
                    }
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Microsoft Azure AD integration requires additional backend configuration.
                    Contact support for setup assistance.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="okta" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SAML/Okta Configuration</CardTitle>
                <CardDescription>
                  Configure SAML-based identity providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    SAML integration is an enterprise feature. Contact our sales team for setup.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>SSO Policies</CardTitle>
            <CardDescription>
              Configure how SSO behaves in your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="force-sso">Force SSO</Label>
                <p className="text-sm text-muted-foreground">
                  Require all users to sign in via SSO (disables email/password)
                </p>
              </div>
              <Switch
                id="force-sso"
                checked={config.force_sso}
                onCheckedChange={(checked) => setConfig({ ...config, force_sso: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-provision">Auto-provision Users</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create user accounts on first SSO login
                </p>
              </div>
              <Switch
                id="auto-provision"
                checked={config.auto_provision}
                onCheckedChange={(checked) => setConfig({ ...config, auto_provision: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-role">Default Role for New Users</Label>
              <select
                id="default-role"
                className="w-full p-2 border rounded-md"
                value={config.default_role}
                onChange={(e) => setConfig({ ...config, default_role: e.target.value })}
              >
                <option value="viewer">Viewer</option>
                <option value="hiring_manager">Hiring Manager</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={saveConfig} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Configuration
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
