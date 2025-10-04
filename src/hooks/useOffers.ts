import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Offer {
  id: string;
  application_id: string;
  candidate_id: string;
  job_id: string;
  offer_letter_content: string;
  job_title: string;
  department: string | null;
  start_date: string;
  salary_amount: number;
  salary_currency: string;
  benefits: string[] | null;
  status: string;
  approval_level: number;
  required_approval_levels: number;
  sent_at: string | null;
  accepted_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export function useOffers(candidateId?: string, status?: string) {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchOffers() {
      try {
        const { data, error } = await supabase.rpc('get_offers', {
          _user_id: user.id,
          _candidate_id: candidateId || null,
          _status: status || null,
        });

        if (error) throw error;
        setOffers(data || []);
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOffers();
  }, [user, candidateId, status]);

  return { offers, loading, refetch: () => setLoading(true) };
}

export async function generateOfferLetter({
  candidateName,
  jobTitle,
  department,
  salary,
  startDate,
  benefits,
  companyName,
}: {
  candidateName: string;
  jobTitle: string;
  department?: string;
  salary: number;
  startDate: string;
  benefits?: string[];
  companyName: string;
}) {
  const { data, error } = await supabase.functions.invoke('generate-offer-letter', {
    body: {
      candidateName,
      jobTitle,
      department,
      salary,
      startDate,
      benefits,
      companyName,
    },
  });

  if (error) throw error;
  return data.offerLetter;
}

export async function createOffer({
  userId,
  applicationId,
  candidateId,
  jobId,
  offerLetterContent,
  jobTitle,
  startDate,
  salaryAmount,
  benefits,
}: {
  userId: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  offerLetterContent: string;
  jobTitle: string;
  startDate: string;
  salaryAmount: number;
  benefits?: string[];
}) {
  const { data, error } = await supabase.rpc('create_offer', {
    _user_id: userId,
    _application_id: applicationId,
    _candidate_id: candidateId,
    _job_id: jobId,
    _offer_letter_content: offerLetterContent,
    _job_title: jobTitle,
    _start_date: startDate,
    _salary_amount: salaryAmount,
    _benefits: benefits || null,
  });

  if (error) throw error;
  return data;
}

export async function updateOfferStatus(
  userId: string,
  offerId: string,
  newStatus: string,
  notes?: string
) {
  const { error } = await supabase.rpc('update_offer_status', {
    _user_id: userId,
    _offer_id: offerId,
    _new_status: newStatus,
    _notes: notes || null,
  });

  if (error) throw error;
}
