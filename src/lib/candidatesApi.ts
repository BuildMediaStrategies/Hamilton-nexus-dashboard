import { supabase } from '@/lib/supabaseClient';

export type CandidateStatus =
  | 'new'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'placed'
  | 'archived';

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  current_role: string | null;
  status: CandidateStatus;
  source: string | null;
  notes: string | null;
  cv_url: string | null;
  job_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchCandidates(
  status?: CandidateStatus | 'all'
): Promise<Candidate[]> {
  let query = supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }

  return (data ?? []) as Candidate[];
}

export async function createCandidate(
  payload: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>
): Promise<Candidate> {
  const { data, error } = await supabase
    .from('candidates')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating candidate:', error);
    throw error;
  }

  return data as Candidate;
}

export async function updateCandidate(
  id: string,
  payload: Partial<Omit<Candidate, 'id'>>
): Promise<Candidate> {
  const updateData = {
    ...payload,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('candidates')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating candidate:', error);
    throw error;
  }

  return data as Candidate;
}

export async function deleteCandidate(id: string): Promise<void> {
  const { error } = await supabase.from('candidates').delete().eq('id', id);

  if (error) {
    console.error('Error deleting candidate:', error);
    throw error;
  }
}

