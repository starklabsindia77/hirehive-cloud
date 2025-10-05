import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

export function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for both auth and role checks to complete
    if (!authLoading && !roleLoading) {
      if (!user) {
        // Not authenticated, redirect to auth page
        navigate('/auth');
      } else if (!isSuperAdmin) {
        // Authenticated but not super admin, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [user, isSuperAdmin, authLoading, roleLoading, navigate]);

  // Show loading state while checking permissions
  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // Only render children if user is authenticated and is super admin
  if (user && isSuperAdmin) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}
