import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { Settings, Save, Palette, Code, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PlatformSettings() {
  const { settings, isLoading, updateSettings } = usePlatformSettings();
  const [formData, setFormData] = useState({
    platform_name: '',
    platform_logo_url: '',
    primary_color: '',
    secondary_color: '',
    favicon_url: '',
    login_page_title: '',
    login_page_subtitle: '',
    custom_css: '',
    custom_header_code: '',
    custom_footer_code: ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        platform_name: settings.platform_name || '',
        platform_logo_url: settings.platform_logo_url || '',
        primary_color: settings.primary_color || '',
        secondary_color: settings.secondary_color || '',
        favicon_url: settings.favicon_url || '',
        login_page_title: settings.login_page_title || '',
        login_page_subtitle: settings.login_page_subtitle || '',
        custom_css: settings.custom_css || '',
        custom_header_code: settings.custom_header_code || '',
        custom_footer_code: settings.custom_footer_code || ''
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(formData);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading platform settings...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Platform Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure global platform settings and branding
            </p>
          </div>
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="custom-code" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Custom Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic platform information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform_name">Platform Name</Label>
                  <Input
                    id="platform_name"
                    value={formData.platform_name}
                    onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
                    placeholder="NexHire"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login_page_title">Login Page Title</Label>
                  <Input
                    id="login_page_title"
                    value={formData.login_page_title}
                    onChange={(e) => setFormData({ ...formData, login_page_title: e.target.value })}
                    placeholder="Welcome to NexHire"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login_page_subtitle">Login Page Subtitle</Label>
                  <Textarea
                    id="login_page_subtitle"
                    value={formData.login_page_subtitle}
                    onChange={(e) => setFormData({ ...formData, login_page_subtitle: e.target.value })}
                    placeholder="The modern hiring platform for exceptional teams"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Assets</CardTitle>
                <CardDescription>
                  Customize platform appearance and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform_logo_url">Platform Logo URL</Label>
                  <Input
                    id="platform_logo_url"
                    value={formData.platform_logo_url}
                    onChange={(e) => setFormData({ ...formData, platform_logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                  {formData.platform_logo_url && (
                    <img
                      src={formData.platform_logo_url}
                      alt="Platform Logo Preview"
                      className="h-12 mt-2 object-contain"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="favicon_url">Favicon URL</Label>
                  <Input
                    id="favicon_url"
                    value={formData.favicon_url}
                    onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value })}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        placeholder="#0ea5e9"
                      />
                      <div
                        className="w-12 h-10 rounded border"
                        style={{ backgroundColor: formData.primary_color }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        placeholder="#8b5cf6"
                      />
                      <div
                        className="w-12 h-10 rounded border"
                        style={{ backgroundColor: formData.secondary_color }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom-code" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom CSS</CardTitle>
                <CardDescription>
                  Add custom CSS to style the entire platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.custom_css}
                  onChange={(e) => setFormData({ ...formData, custom_css: e.target.value })}
                  placeholder=".custom-class { color: red; }"
                  rows={10}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Header Code</CardTitle>
                <CardDescription>
                  Add custom scripts or meta tags to the header
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.custom_header_code}
                  onChange={(e) => setFormData({ ...formData, custom_header_code: e.target.value })}
                  placeholder="<!-- Analytics scripts, meta tags, etc. -->"
                  rows={6}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Footer Code</CardTitle>
                <CardDescription>
                  Add custom scripts to load before the closing body tag
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.custom_footer_code}
                  onChange={(e) => setFormData({ ...formData, custom_footer_code: e.target.value })}
                  placeholder="<!-- Chat widgets, tracking pixels, etc. -->"
                  rows={6}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
