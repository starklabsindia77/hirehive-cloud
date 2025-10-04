# Subdomain Setup Guide

## Overview
Each organization can have a custom subdomain with branded login pages (e.g., `acme.yourdomain.com`).

## Features
- **Organization Branding**: Each subdomain displays the organization's logo, colors, and name
- **Login-Only Access**: Subdomain login pages show only login form (no signup)
- **Main Domain Signup**: New users must sign up through the main domain
- **Automatic Routing**: Subdomain root (`/`) redirects to branded login page

## How It Works

### 1. Organization Setup
1. Admin/Owner logs into the main platform
2. Goes to Settings → Custom Subdomain
3. Enters desired subdomain (e.g., "acme")
4. Checks availability
5. Saves subdomain configuration

### 2. DNS Configuration
After subdomain is configured in the platform:

**Wildcard Subdomain (Recommended)**
```
Type: CNAME
Name: *
Value: yourmainplatform.com
TTL: 3600
```

**Individual Subdomain**
```
Type: CNAME
Name: acme
Value: yourmainplatform.com
TTL: 3600
```

### 3. User Access
- **Organization Members**: Visit `acme.yourdomain.com/auth` and login with existing credentials
- **New Users**: Must first sign up at the main domain (`yourdomain.com/auth`)
- **After Login**: All users are redirected to `/dashboard` regardless of subdomain

## Technical Implementation

### Subdomain Detection
The platform automatically detects subdomains using `src/utils/subdomain.ts`:
- Excludes `localhost` and IP addresses
- Excludes Lovable preview domains
- Excludes common subdomains (`www`, `app`, `api`, `admin`, `mail`)

### Routing
- **Main Domain** (`yourdomain.com/auth`): Full auth page with login AND signup
- **Subdomain** (`acme.yourdomain.com/auth`): Branded login page (login only)
- **Root Subdomain** (`acme.yourdomain.com/`): Automatically redirects to `/auth`

### Organization Branding
The subdomain login page fetches organization data via RPC:
```typescript
get_organization_by_subdomain(_subdomain: TEXT)
```

Returns:
- Organization name and brand name
- Logo URL
- Primary and secondary colors
- Schema name

### Security
- **Subdomain Validation**: Only lowercase alphanumeric and hyphens
- **Uniqueness**: Each subdomain can only be used once
- **Permissions**: Only organization owners/admins can update subdomains
- **RLS Policies**: All data access follows row-level security

## Testing

### Local Development
Subdomains won't work on `localhost`. Options:
1. Use a tool like `ngrok` to create public tunnels
2. Add test entries to `/etc/hosts`:
   ```
   127.0.0.1 acme.localhost
   ```
3. Deploy to staging environment for testing

### Production Testing
1. Set up subdomain in organization settings
2. Configure DNS records at your registrar
3. Wait for DNS propagation (up to 48 hours)
4. Visit `yoursubdomain.yourdomain.com/auth`
5. Verify branding appears correctly
6. Test login with organization member credentials

## Troubleshooting

### Subdomain not resolving
- Check DNS records are configured correctly
- Wait for DNS propagation (use https://dnschecker.org)
- Clear browser cache and DNS cache

### Organization branding not showing
- Verify subdomain is saved in organization settings
- Check organization has logo_url and colors configured
- Check browser console for API errors

### Login not working
- Verify user exists and is part of the organization
- Check that auth is properly configured
- Ensure RLS policies allow user login

## Future Enhancements
- Custom domains (not just subdomains)
- Custom CSS per organization
- Custom login page background images
- SSO integration per subdomain
- Multi-tenancy isolation improvements
