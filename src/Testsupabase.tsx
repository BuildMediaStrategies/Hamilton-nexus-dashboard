import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Job } from '@/lib/jobsApi';

export default function TestSupabase() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const { data, error } = await supabase.from('jobs').select('*');
        if (error) throw error;
        setJobs((data ?? []) as Job[]);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(message);
      }
    }

    fetchJobs();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Supabase Test</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!error && (
        <>
          <p>Found {jobs.length} job(s)</p>
          <ul>
            {jobs.map((job) => (
              <li key={job.id}>
                <strong>{job.title}</strong> – {job.location} [{job.status}]
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

