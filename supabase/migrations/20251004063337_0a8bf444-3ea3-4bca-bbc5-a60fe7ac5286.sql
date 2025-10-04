-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'recruiter', 'hiring_manager', 'viewer');

-- Organizations table (in public schema)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  schema_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Profiles table for user metadata
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, organization_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Function to get user's organization schema
CREATE OR REPLACE FUNCTION public.get_user_org_schema(_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.schema_name
  FROM public.profiles p
  JOIN public.organizations o ON p.organization_id = o.id
  WHERE p.user_id = _user_id
  LIMIT 1;
$$;

-- Function to create organization schema with tables
CREATE OR REPLACE FUNCTION public.create_organization_schema(_org_id UUID, _schema_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create the schema
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', _schema_name);
  
  -- Create jobs table in org schema
  EXECUTE format('
    CREATE TABLE %I.jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      department TEXT,
      location TEXT,
      employment_type TEXT,
      description TEXT,
      requirements TEXT,
      status TEXT DEFAULT ''open'',
      created_by UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )', _schema_name);
  
  -- Create candidates table in org schema
  EXECUTE format('
    CREATE TABLE %I.candidates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      linkedin_url TEXT,
      resume_url TEXT,
      current_company TEXT,
      current_position TEXT,
      experience_years INTEGER,
      skills TEXT[],
      status TEXT DEFAULT ''new'',
      stage TEXT DEFAULT ''applied'',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )', _schema_name);
  
  -- Create applications table in org schema
  EXECUTE format('
    CREATE TABLE %I.applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_id UUID NOT NULL REFERENCES %I.jobs(id) ON DELETE CASCADE,
      candidate_id UUID NOT NULL REFERENCES %I.candidates(id) ON DELETE CASCADE,
      status TEXT DEFAULT ''applied'',
      stage TEXT DEFAULT ''screening'',
      notes TEXT,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )', _schema_name, _schema_name, _schema_name);
  
  -- Grant usage on schema to authenticated users
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO authenticated', _schema_name);
  EXECUTE format('GRANT ALL ON ALL TABLES IN SCHEMA %I TO authenticated', _schema_name);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON TABLES TO authenticated', _schema_name);
END;
$$;

-- RLS Policies for organizations
CREATE POLICY "Users can view their organization"
  ON public.organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their organization"
  ON public.organizations FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'owner') AND
    id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their organization"
  ON public.profiles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles in their organization"
  ON public.user_roles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and admins can manage roles"
  ON public.user_roles FOR ALL
  USING (
    (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin')) AND
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Trigger for updated_at on organizations
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();