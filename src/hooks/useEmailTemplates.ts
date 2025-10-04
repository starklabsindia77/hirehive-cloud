import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_type: string;
  variables: string[] | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useEmailTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplates = async () => {
    if (!user) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_org_email_templates', {
        _user_id: user.id
      });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching email templates:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  const createTemplate = async (
    name: string,
    subject: string,
    content: string,
    templateType: string,
    variables?: string[]
  ) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('create_email_template', {
      _user_id: user.id,
      _name: name,
      _subject: subject,
      _content: content,
      _template_type: templateType,
      _variables: variables || null
    });

    if (error) throw error;
    await fetchTemplates();
    return data;
  };

  const updateTemplate = async (
    templateId: string,
    name: string,
    subject: string,
    content: string,
    templateType: string,
    variables?: string[]
  ) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('update_email_template', {
      _user_id: user.id,
      _template_id: templateId,
      _name: name,
      _subject: subject,
      _content: content,
      _template_type: templateType,
      _variables: variables || null
    });

    if (error) throw error;
    await fetchTemplates();
  };

  const deleteTemplate = async (templateId: string) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('delete_email_template', {
      _user_id: user.id,
      _template_id: templateId
    });

    if (error) throw error;
    await fetchTemplates();
  };

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
}
