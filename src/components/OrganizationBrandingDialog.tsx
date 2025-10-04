import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Palette } from 'lucide-react';

interface OrganizationBrandingDialogProps {
  organizationId: string;
  organizationName: string;
  currentLogoUrl?: string;
  currentHeaderCode?: string;
  currentFooterCode?: string;
}

export function OrganizationBrandingDialog({
  organizationId,
  organizationName,
  currentLogoUrl = '',
  currentHeaderCode = '',
  currentFooterCode = ''
}: OrganizationBrandingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const [headerCode, setHeaderCode] = useState(currentHeaderCode);
  const [footerCode, setFooterCode] = useState(currentFooterCode);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          logo_url: logoUrl || null,
          custom_header_code: headerCode || null,
          custom_footer_code: footerCode || null
        })
        .eq('id', organizationId);

      if (error) throw error;

      toast.success('Organization branding updated successfully');
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update organization branding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="w-4 h-4 mr-2" />
          Branding
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Organization Branding</DialogTitle>
          <DialogDescription>
            Manage logo and custom code for {organizationName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="logo-url">Logo URL</Label>
            <Input
              id="logo-url"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter the URL of the organization's logo
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="header-code">Custom Header Code</Label>
            <Textarea
              id="header-code"
              placeholder="<script>/* Custom tracking code */</script>"
              value={headerCode}
              onChange={(e) => setHeaderCode(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              HTML/JavaScript code to inject in the header (e.g., analytics, meta tags)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer-code">Custom Footer Code</Label>
            <Textarea
              id="footer-code"
              placeholder="<script>/* Custom footer code */</script>"
              value={footerCode}
              onChange={(e) => setFooterCode(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              HTML/JavaScript code to inject in the footer (e.g., chat widgets, scripts)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}