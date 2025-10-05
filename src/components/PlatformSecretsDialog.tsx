import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Key, Plus } from 'lucide-react';
import { usePlatformSecrets, PlatformSecret } from '@/hooks/usePlatformSecrets';

interface PlatformSecretsDialogProps {
  secret?: PlatformSecret;
  trigger?: React.ReactNode;
}

export function PlatformSecretsDialog({ secret, trigger }: PlatformSecretsDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    keyName: secret?.key_name || '',
    keyValue: secret?.key_value || '',
    description: secret?.description || '',
    isActive: secret?.is_active ?? true
  });

  const { updateSecret } = usePlatformSecrets();

  const handleSave = async () => {
    await updateSecret.mutateAsync({
      keyName: formData.keyName,
      keyValue: formData.keyValue,
      description: formData.description,
      isActive: formData.isActive
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Secret
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {secret ? 'Edit Secret' : 'Add New Secret'}
          </DialogTitle>
          <DialogDescription>
            Manage platform API keys and secrets securely
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="keyName">Key Name</Label>
            <Input
              id="keyName"
              placeholder="e.g., OPENAI_API_KEY"
              value={formData.keyName}
              onChange={(e) => setFormData({ ...formData, keyName: e.target.value })}
              disabled={!!secret}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="keyValue">Key Value</Label>
            <Input
              id="keyValue"
              type="password"
              placeholder="Enter secret value"
              value={formData.keyValue}
              onChange={(e) => setFormData({ ...formData, keyValue: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this secret used for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateSecret.isPending}>
            {updateSecret.isPending ? 'Saving...' : 'Save Secret'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
