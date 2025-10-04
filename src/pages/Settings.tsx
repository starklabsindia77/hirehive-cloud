import { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Paintbrush, Upload, Globe2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SubdomainSettings } from '@/components/SubdomainSettings';

export default function Settings() {
  const { organization, refreshOrganization } = useOrganization();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brand_name: '',
    logo_url: '',
    primary_color: '#0ea5e9',
    secondary_color: '#8b5cf6',
    company_description: '',
    careers_tagline: '',
    careers_banner_url: '',
    show_team_size: true,
    show_location: true,
    social_links: {
      website: '',
      linkedin: '',
      twitter: '',
    },
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        brand_name: organization.brand_name || organization.name,
        logo_url: organization.logo_url || '',
        primary_color: organization.primary_color || '#0ea5e9',
        secondary_color: organization.secondary_color || '#8b5cf6',
        company_description: (organization as any).company_description || '',
        careers_tagline: (organization as any).careers_tagline || '',
        careers_banner_url: (organization as any).careers_banner_url || '',
        show_team_size: (organization as any).show_team_size ?? true,
        show_location: (organization as any).show_location ?? true,
        social_links: (organization as any).social_links || {
          website: '',
          linkedin: '',
          twitter: '',
        },
      });
    }
  }, [organization]);

  const handleSave = async () => {
    if (!organization) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          brand_name: formData.brand_name,
          logo_url: formData.logo_url || null,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          company_description: formData.company_description || null,
          careers_tagline: formData.careers_tagline || null,
          careers_banner_url: formData.careers_banner_url || null,
          show_team_size: formData.show_team_size,
          show_location: formData.show_location,
          social_links: formData.social_links,
        })
        .eq('id', organization.id);

      if (error) throw error;

      await refreshOrganization();

      toast({
        title: 'Settings saved',
        description: 'Your branding has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your organization's branding</p>
        </div>

        <div className="grid gap-6">
          {/* Dashboard Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paintbrush className="h-5 w-5" />
                Dashboard Branding
              </CardTitle>
              <CardDescription>
                Customize how your organization appears throughout the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="brand_name">Brand Name</Label>
                <Input
                  id="brand_name"
                  value={formData.brand_name}
                  onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                  placeholder="Your Brand Name"
                />
                <p className="text-xs text-muted-foreground">
                  This name will appear in the sidebar and header
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Logo URL
                </Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a URL to your logo image (recommended size: 512x512px)
                </p>
                {formData.logo_url && (
                  <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <img 
                      src={formData.logo_url} 
                      alt="Logo preview" 
                      className="h-16 w-16 object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.src = '';
                        e.currentTarget.alt = 'Failed to load image';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      placeholder="#0ea5e9"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      placeholder="#8b5cf6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Career Portal Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe2 className="h-5 w-5" />
                Career Portal Branding
              </CardTitle>
              <CardDescription>
                Customize how your career page appears to candidates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="careers_tagline">Career Page Tagline</Label>
                <Input
                  id="careers_tagline"
                  value={formData.careers_tagline}
                  onChange={(e) => setFormData({ ...formData, careers_tagline: e.target.value })}
                  placeholder="e.g., Join our team and make an impact"
                />
                <p className="text-xs text-muted-foreground">
                  A catchy headline for your career page
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_description">Company Description</Label>
                <Textarea
                  id="company_description"
                  value={formData.company_description}
                  onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                  placeholder="Tell candidates about your company, mission, and culture..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  This will appear on your career page
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="careers_banner_url">Banner Image URL</Label>
                <Input
                  id="careers_banner_url"
                  value={formData.careers_banner_url}
                  onChange={(e) => setFormData({ ...formData, careers_banner_url: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Hero banner for your career page (recommended: 1920x600px)
                </p>
                {formData.careers_banner_url && (
                  <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden border">
                    <img
                      src={formData.careers_banner_url}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Social Media Links</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Website URL"
                    value={formData.social_links.website}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, website: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="LinkedIn URL"
                    value={formData.social_links.linkedin}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, linkedin: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="Twitter/X URL"
                    value={formData.social_links.twitter}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, twitter: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Display Options</Label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_team_size}
                      onChange={(e) => setFormData({ ...formData, show_team_size: e.target.checked })}
                      className="rounded border-input"
                    />
                    <span className="text-sm">Show team size</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_location}
                      onChange={(e) => setFormData({ ...formData, show_location: e.target.checked })}
                      className="rounded border-input"
                    />
                    <span className="text-sm">Show location info</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Subdomain */}
          <SubdomainSettings />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading} size="lg">
              {loading ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
