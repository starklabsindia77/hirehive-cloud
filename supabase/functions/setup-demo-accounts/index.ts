import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { secret } = await req.json();
    
    // Validate setup secret
    if (secret !== Deno.env.get('DEMO_SETUP_SECRET')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Starting demo account setup...');

    // Demo organizations
    const organizations = [
      { name: 'TechCorp Solutions', schema_name: 'org_techcorp' },
      { name: 'StartupHub Inc', schema_name: 'org_startuphub' },
    ];

    // Demo users with their roles
    const demoUsers = [
      { email: 'owner@techcorp.demo', password: 'Demo123!', display_name: 'Sarah Johnson', org: 'TechCorp Solutions', role: 'owner' },
      { email: 'admin@techcorp.demo', password: 'Demo123!', display_name: 'Michael Chen', org: 'TechCorp Solutions', role: 'admin' },
      { email: 'recruiter@techcorp.demo', password: 'Demo123!', display_name: 'Emily Davis', org: 'TechCorp Solutions', role: 'recruiter' },
      { email: 'owner@startuphub.demo', password: 'Demo123!', display_name: 'James Wilson', org: 'StartupHub Inc', role: 'owner' },
      { email: 'recruiter@startuphub.demo', password: 'Demo123!', display_name: 'Lisa Anderson', org: 'StartupHub Inc', role: 'recruiter' },
    ];

    const createdAccounts = [];

    // Create organizations
    console.log('Creating organizations...');
    const { data: orgsData, error: orgsError } = await supabaseAdmin
      .from('organizations')
      .insert(organizations)
      .select();

    if (orgsError) {
      console.error('Error creating organizations:', orgsError);
      throw orgsError;
    }

    console.log('Organizations created:', orgsData);

    // Create organization schemas
    for (const org of orgsData) {
      console.log(`Creating schema for ${org.name}...`);
      const { error: schemaError } = await supabaseAdmin.rpc('create_organization_schema', {
        _org_id: org.id,
        _schema_name: org.schema_name
      });

      if (schemaError) {
        console.error(`Error creating schema for ${org.name}:`, schemaError);
      }
    }

    // Create users, profiles, and roles
    for (const user of demoUsers) {
      console.log(`Creating user: ${user.email}`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          display_name: user.display_name
        }
      });

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError);
        continue;
      }

      console.log(`Auth user created: ${authData.user.id}`);

      // Find organization
      const org = orgsData.find(o => o.name === user.org);
      if (!org) {
        console.error(`Organization not found: ${user.org}`);
        continue;
      }

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email: user.email,
          display_name: user.display_name,
          organization_id: org.id
        });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError);
        continue;
      }

      console.log(`Profile created for ${user.email}`);

      // Assign role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          organization_id: org.id,
          role: user.role
        });

      if (roleError) {
        console.error(`Error assigning role for ${user.email}:`, roleError);
        continue;
      }

      console.log(`Role assigned to ${user.email}: ${user.role}`);

      createdAccounts.push({
        email: user.email,
        password: user.password,
        display_name: user.display_name,
        organization: user.org,
        role: user.role
      });
    }

    console.log('Demo setup completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Demo accounts created successfully',
        accounts: createdAccounts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in setup-demo-accounts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
