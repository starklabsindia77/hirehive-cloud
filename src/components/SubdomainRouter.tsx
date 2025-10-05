import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isSubdomain } from '@/utils/subdomain';
import OrganizationAuth from '@/pages/OrganizationAuth';
import Auth from '@/pages/Auth';
import Index from '@/pages/Index';

/**
 * Routes to organization-specific auth page if on subdomain,
 * otherwise shows regular auth page
 */
export function SubdomainRouter() {
  const location = useLocation();
  const navigate = useNavigate();
  const onSubdomain = isSubdomain();

  useEffect(() => {
    // If on subdomain and trying to access main auth, use org auth instead
    if (onSubdomain && location.pathname === '/auth') {
      // Don't redirect, just render OrganizationAuth
      return;
    }
  }, [onSubdomain, location.pathname]);

  // Show organization auth on subdomains
  if (onSubdomain) {
    return <OrganizationAuth />;
  }

  // Show regular auth on main domain
  return <Index />;
}
