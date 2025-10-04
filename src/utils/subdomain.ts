/**
 * Extract subdomain from current hostname
 * Returns null if on main domain or localhost
 */
export function getSubdomain(): string | null {
  const hostname = window.location.hostname;
  
  // Skip for localhost and IP addresses
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }
  
  // Skip for Lovable preview domains
  if (hostname.includes('.lovableproject.com')) {
    return null;
  }
  
  const parts = hostname.split('.');
  
  // Need at least subdomain.domain.tld (3 parts)
  if (parts.length < 3) {
    return null;
  }
  
  // Return first part as subdomain
  const subdomain = parts[0];
  
  // Exclude common non-organization subdomains
  const excluded = ['www', 'app', 'api', 'admin', 'mail'];
  if (excluded.includes(subdomain)) {
    return null;
  }
  
  return subdomain;
}

/**
 * Check if current URL is on a subdomain
 */
export function isSubdomain(): boolean {
  return getSubdomain() !== null;
}

/**
 * Build main domain URL
 */
export function getMainDomainUrl(path: string = ''): string {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // For localhost, just use localhost
  if (hostname === 'localhost') {
    return `${protocol}//${hostname}:${window.location.port}${path}`;
  }
  
  // For Lovable preview domains
  if (hostname.includes('.lovableproject.com')) {
    return `${protocol}//${hostname}${path}`;
  }
  
  // Extract main domain (domain.tld)
  const parts = hostname.split('.');
  const mainDomain = parts.slice(-2).join('.');
  
  return `${protocol}//${mainDomain}${path}`;
}
