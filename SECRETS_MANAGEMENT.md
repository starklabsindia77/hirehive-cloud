# Platform Secrets Management

This project uses database-based secrets management instead of environment variables for better security and flexibility.

## Overview

All API keys and sensitive configuration are stored in the `platform_secrets` table in the database. This allows:
- Centralized secret management through the admin UI
- Rotation of secrets without redeploying code
- Per-secret activation/deactivation
- Audit trail of secret changes

## Super Admin UI

Super admins can manage secrets through the UI at `/platform-secrets`:
- View all configured secrets
- Add new secrets
- Update existing secrets
- Toggle secret activation
- View secret metadata (description, last updated)

## Using Secrets in Edge Functions

### 1. Import Supabase Client

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
```

### 2. Retrieve Secret from Database

```typescript
// Get secret using the security definer function
const { data: apiKey, error } = await supabase
  .rpc('get_platform_secret', { _key_name: 'OPENAI_API_KEY' });

if (error || !apiKey) {
  console.error('Failed to retrieve API key:', error);
  return new Response(
    JSON.stringify({ error: 'API key not configured' }),
    { status: 500, headers: corsHeaders }
  );
}

// Use the secret
const response = await fetch('https://api.openai.com/v1/...', {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
  }
});
```

### Complete Example

```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Retrieve API key from database
    const { data: apiKey, error: keyError } = await supabase
      .rpc('get_platform_secret', { _key_name: 'OPENAI_API_KEY' });

    if (keyError || !apiKey) {
      console.error('Failed to retrieve API key:', keyError);
      return new Response(
        JSON.stringify({ error: 'API key not configured. Please add it in Platform Secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Your edge function logic here using the API key
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

## Common Secrets

The following secrets are commonly used:

- `OPENAI_API_KEY` - OpenAI API key for AI features
- `LOVABLE_API_KEY` - Lovable AI Gateway API key
- `SMTP_HOST` - SMTP server for email sending
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASSWORD` - SMTP password

## Security Best Practices

1. **Never log secret values** - Always log errors without including the actual secret
2. **Check activation status** - The `get_platform_secret` function only returns active secrets
3. **Handle missing secrets gracefully** - Return meaningful error messages when secrets are not configured
4. **Use descriptive secret names** - Use uppercase with underscores (e.g., `STRIPE_SECRET_KEY`)
5. **Add descriptions** - Always add a description explaining what the secret is used for

## Database Schema

```sql
CREATE TABLE public.platform_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL UNIQUE,
  key_value TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Functions

### `get_platform_secret(_key_name TEXT)`

Retrieves an active secret value by key name. This is a security definer function that can be called from edge functions.

**Returns:** TEXT (the secret value) or NULL if not found or inactive

### `set_platform_secret(_key_name TEXT, _key_value TEXT, _description TEXT)`

Creates or updates a secret. Only accessible by super admins.

**Returns:** UUID (the secret ID)
