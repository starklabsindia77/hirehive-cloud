import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useOrganizationBySubdomain } from '@/hooks/useOrganizationBySubdomain';
import { getMainDomainUrl } from '@/utils/subdomain';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function OrganizationAuth() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { data: organization, isLoading } = useOrganizationBySubdomain();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(loginData.email, loginData.password);

    if (error) {
      toast.error(error.message || 'Login failed');
    } else {
      toast.success('Logged in successfully');
      navigate('/dashboard');
    }

    setLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Organization Not Found</CardTitle>
            <CardDescription>
              This subdomain is not associated with any organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => window.location.href = getMainDomainUrl('/auth')}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Main Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const brandName = organization.brand_name || organization.name;
  const primaryColor = organization.primary_color || '#0ea5e9';
  const secondaryColor = organization.secondary_color || '#8b5cf6';

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--background)) 50%, ${primaryColor}15 100%)`
      }}
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          {organization.logo_url ? (
            <div className="flex justify-center">
              <img
                src={organization.logo_url}
                alt={brandName}
                className="h-20 w-auto object-contain"
              />
            </div>
          ) : (
            <div 
              className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg"
              style={{ 
                backgroundColor: primaryColor,
                boxShadow: `0 10px 40px -10px ${primaryColor}60`
              }}
            >
              {brandName[0]}
            </div>
          )}
          <div>
            <CardTitle className="text-3xl font-bold">{brandName}</CardTitle>
            <CardDescription className="mt-2 text-base">Sign in to your account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                autoComplete="current-password"
                className="h-11"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold" 
              disabled={loading}
              style={{
                backgroundColor: primaryColor,
                color: 'white'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Not a member of {brandName}?
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.href = getMainDomainUrl('/auth')}
              className="text-sm"
            >
              Sign up on main platform
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-sm text-muted-foreground">
          Powered by NexHire
        </p>
      </div>
    </div>
  );
}
