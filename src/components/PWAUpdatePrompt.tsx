import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

export function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowPrompt(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    setShowPrompt(false);
    window.location.reload();
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-top-5">
      <Card className="shadow-lg border-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Update Available</CardTitle>
          <CardDescription>
            A new version of HireHive is ready to install
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleUpdate} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
