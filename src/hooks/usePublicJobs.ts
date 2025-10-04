import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublicJob {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  description: string | null;
  requirements: string | null;
  status: string;
  created_at: string;
  organization_name: string;
  organization_id: string;
  organization_schema?: string;
  brand_name?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  company_description?: string | null;
  careers_tagline?: string | null;
  careers_banner_url?: string | null;
  social_links?: any;
  show_team_size?: boolean;
  show_location?: boolean;
  custom_css?: string | null;
}

export function usePublicJobs(orgSchema?: string) {
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPublicJobs() {
      try {
        const { data, error } = await supabase.rpc('get_public_jobs', {
          _org_schema: orgSchema || null
        });

        if (error) throw error;
        setJobs(data || []);
      } catch (err) {
        console.error('Error fetching public jobs:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicJobs();
  }, [orgSchema]);

  return { jobs, loading, error };
}

export function usePublicJob(jobId: string) {
  const [job, setJob] = useState<PublicJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPublicJob() {
      if (!jobId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_public_job', {
          _job_id: jobId
        });

        if (error) throw error;
        setJob(data && data.length > 0 ? data[0] : null);
      } catch (err) {
        console.error('Error fetching public job:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicJob();
  }, [jobId]);

  return { job, loading, error };
}
