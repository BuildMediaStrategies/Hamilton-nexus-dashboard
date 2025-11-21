import { supabase } from '@/lib/supabaseClient';

export type JobStatus = 'draft' | 'live' | 'closed';
export type JobType = 'Permanent' | 'Contract' | 'Temporary';

export interface Job {
  id: string;
  title: string;
  location: string;
  salary_range: string | null;
  job_type: JobType;
  description: string;
  requirements: string[] | null;
  benefits: string[] | null;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  closed_at: string | null;
  view_count: number | null;
  application_count: number | null;
}

export interface JobPayload {
  title: string;
  location: string;
  salary_range?: string;
  job_type: JobType;
  description: string;
  requirements: string[];
  benefits: string[];
  status: JobStatus;
  expires_at?: string | null;
}

export async function fetchJobs(opts?: {
  status?: JobStatus | 'all';
  search?: string;
}): Promise<Job[]> {
  const statusFilter = opts?.status ?? 'all';
  const search = opts?.search?.trim();

  let query = supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }

  let jobs = (data ?? []) as Job[];

  if (search) {
    const lowerSearch = search.toLowerCase();
    jobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(lowerSearch) ||
        job.location.toLowerCase().includes(lowerSearch)
    );
  }

  return jobs;
}

export async function createJob(payload: JobPayload): Promise<Job> {
  const insertPayload = {
    title: payload.title,
    location: payload.location,
    salary_range: payload.salary_range ?? null,
    job_type: payload.job_type,
    description: payload.description,
    requirements: payload.requirements ?? [],
    benefits: payload.benefits ?? [],
    status: payload.status,
    expires_at: payload.expires_at ?? null
  };

  const { data, error } = await supabase
    .from('jobs')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    console.error('Supabase jobs create error', error);
    throw error;
  }

  return data as Job;
}

export async function updateJob(
  id: string,
  payload: Partial<JobPayload>
): Promise<Job> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };

  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.location !== undefined) updateData.location = payload.location;
  if (payload.salary_range !== undefined) {
    updateData.salary_range = payload.salary_range;
  }
  if (payload.job_type !== undefined) updateData.job_type = payload.job_type;
  if (payload.description !== undefined) {
    updateData.description = payload.description;
  }
  if (payload.requirements !== undefined) {
    updateData.requirements = payload.requirements;
  }
  if (payload.benefits !== undefined) {
    updateData.benefits = payload.benefits;
  }
  if (payload.status !== undefined) {
    updateData.status = payload.status;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'expires_at')) {
    updateData.expires_at = payload.expires_at ?? null;
  }

  const { data, error } = await supabase
    .from('jobs')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Supabase jobs update error', error);
    throw error;
  }

  return data as Job;
}

export async function duplicateJob(job: Job): Promise<Job> {
  const insertPayload = {
    title: `${job.title} (Copy)`,
    location: job.location,
    salary_range: job.salary_range,
    job_type: job.job_type,
    description: job.description,
    requirements: job.requirements ?? [],
    benefits: job.benefits ?? [],
    status: 'draft' as JobStatus,
    expires_at: job.expires_at
  };

  const { data, error } = await supabase
    .from('jobs')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    console.error('Error duplicating job:', error);
    throw error;
  }

  return data as Job;
}

export async function setJobStatus(
  id: string,
  newStatus: JobStatus
): Promise<Job> {
  const updateData: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  if (newStatus === 'closed') {
    updateData.closed_at = new Date().toISOString();
  } else {
    updateData.closed_at = null;
  }

  const { data, error } = await supabase
    .from('jobs')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error setting job status:', error);
    throw error;
  }

  return data as Job;
}

export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabase.from('jobs').delete().eq('id', id);

  if (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
}
