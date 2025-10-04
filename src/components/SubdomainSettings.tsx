import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Globe, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

export function SubdomainSettings() {
  const { organization, refreshOrganization } = useOrganization();
  const [subdomain, setSubdomain] = useState(organization?.subdomain || '');
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const checkAvailability = async () => {
    if (!subdomain || subdomain.length < 3) {
      toast.error('Subdomain must be at least 3 characters');
      return;
    }

    // Validate format
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(subdomain)) {
      toast.error('Use only lowercase letters, numbers, and hyphens');
      return;
    }

    setChecking(true);
    try {
      const { data, error } = await supabase.rpc('is_subdomain_available', {
        _subdomain: subdomain.toLowerCase()
      });

      if (error) throw error;

      setAvailable(data);
      if (data) {
        toast.success('Subdomain is available!');
      } else {
        toast.error('Subdomain is already taken');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to check availability');
    } finally {
      setChecking(false);
    }
  };

  const saveSubdomain = async () => {
    if (!organization) return;

    setSaving(true);
    try {
      const { error } = await supabase.rpc('update_organization_subdomain', {
        _org_id: organization.id,
        _subdomain: subdomain.toLowerCase()
      });

      if (error) throw error;

      toast.success('Subdomain updated successfully');
      refreshOrganization();
      setAvailable(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update subdomain');
    } finally {
      setSaving(false);
    }
  };

  const currentSubdomain = organization?.subdomain;
  const fullUrl = currentSubdomain ? `https://${currentSubdomain}.yourdomain.com` : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          <CardTitle>Custom Subdomain</CardTitle>
        </div>
        <CardDescription>
          Set up a custom subdomain for your organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSubdomain && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Your organization is accessible at:{' '}
              <a 
                href={fullUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium underline inline-flex items-center gap-1"
              >
                {fullUrl}
                <ExternalLink className="w-3 h-3" />
              </a>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="subdomain">Subdomain</Label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2">
              <Input
                id="subdomain"
                value={subdomain}
                onChange={(e) => {
                  setSubdomain(e.target.value.toLowerCase());
                  setAvailable(null);
                }}
                placeholder="acme"
                className="max-w-xs"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                .yourdomain.com
              </span>
            </div>
            <Button
              variant="outline"
              onClick={checkAvailability}
              disabled={checking || !subdomain || subdomain === currentSubdomain}
            >
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Availability'
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Use lowercase letters, numbers, and hyphens. Minimum 3 characters.
          </p>
        </div>

        {available !== null && (
          <Alert variant={available ? 'default' : 'destructive'}>
            {available ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>{subdomain}.yourdomain.com</strong> is available!
                </AlertDescription>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This subdomain is already taken. Try another one.
                </AlertDescription>
              </>
            )}
          </Alert>
        )}

        <div className="pt-4">
          <Button
            onClick={saveSubdomain}
            disabled={saving || !available || subdomain === currentSubdomain}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Subdomain'
            )}
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>How it works:</strong> Once configured, your subdomain will have its own branded login page 
            (e.g., <code className="bg-muted px-1 py-0.5 rounded">{subdomain || 'acme'}.yourdomain.com/auth</code>). 
            This page will display your organization's logo and colors, with login-only access (no public signup).
            <br /><br />
            <strong>DNS Setup:</strong> You'll need to configure DNS records with your domain provider 
            to point your subdomain to the platform. Contact support for DNS configuration assistance.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
