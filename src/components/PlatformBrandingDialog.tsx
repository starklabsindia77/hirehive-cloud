import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { Loader2, Sparkles } from 'lucide-react';

export function PlatformBrandingDialog() {
  const { settings, updateSettings } = usePlatformSettings();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    platform_name: '',
    platform_logo_url: '',
    primary_color: '#0ea5e9',
    secondary_color: '#8b5cf6',
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
        primary_color: settings.primary_color || '#0ea5e9',
        secondary_color: settings.secondary_color || '#8b5cf6',
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
    await updateSettings.mutateAsync(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg">
          <Sparkles className="w-4 h-4 mr-2" />
          Platform Branding
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Platform Branding Settings</DialogTitle>
          <DialogDescription>
            Customize the global appearance and branding of the platform
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="login">Login Page</TabsTrigger>
            <TabsTrigger value="code">Custom Code</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input
                id="platform-name"
                value={formData.platform_name}
                onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
                placeholder="NexHire"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo-url">Platform Logo URL</Label>
              <Input
                id="logo-url"
                value={formData.platform_logo_url}
                onChange={(e) => setFormData({ ...formData, platform_logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="favicon-url">Favicon URL</Label>
              <Input
                id="favicon-url"
                value={formData.favicon_url}
                onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value })}
                placeholder="https://example.com/favicon.ico"
              />
              <p className="text-sm text-muted-foreground">
                Upload to public/favicon.ico or provide external URL
              </p>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  placeholder="#0ea5e9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  placeholder="#8b5cf6"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-css">Custom CSS</Label>
              <Textarea
                id="custom-css"
                value={formData.custom_css}
                onChange={(e) => setFormData({ ...formData, custom_css: e.target.value })}
                placeholder=":root { --custom-property: value; }"
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Global CSS to apply across the platform
              </p>
            </div>
          </TabsContent>

          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-title">Login Page Title</Label>
              <Input
                id="login-title"
                value={formData.login_page_title}
                onChange={(e) => setFormData({ ...formData, login_page_title: e.target.value })}
                placeholder="Welcome to NexHire"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-subtitle">Login Page Subtitle</Label>
              <Textarea
                id="login-subtitle"
                value={formData.login_page_subtitle}
                onChange={(e) => setFormData({ ...formData, login_page_subtitle: e.target.value })}
                placeholder="Sign in or create your organization account"
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="header-code">Custom Header Code</Label>
              <Textarea
                id="header-code"
                value={formData.custom_header_code}
                onChange={(e) => setFormData({ ...formData, custom_header_code: e.target.value })}
                placeholder="<script>/* Global analytics, meta tags */</script>"
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                HTML/JavaScript to inject in header for all pages
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer-code">Custom Footer Code</Label>
              <Textarea
                id="footer-code"
                value={formData.custom_footer_code}
                onChange={(e) => setFormData({ ...formData, custom_footer_code: e.target.value })}
                placeholder="<script>/* Global footer scripts */</script>"
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                HTML/JavaScript to inject in footer for all pages
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={updateSettings.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Platform Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
