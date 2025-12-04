import { useEffect, useState } from 'react';
import { TestTube, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

interface Job {
  id: string;
  title: string;
  location: string;
  status: string;
  created_at: string;
}

export function SurveysPage() {
  const [testResults, setTestResults] = useState<{
    authenticatedFetch: { success: boolean; count: number; error?: string };
    anonymousFetch: { success: boolean; count: number; error?: string };
    jobs: Job[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const results = {
      authenticatedFetch: { success: false, count: 0, error: '' },
      anonymousFetch: { success: false, count: 0, error: '' },
      jobs: [] as Job[]
    };

    try {
      const { data: authJobs, error: authError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'live')
        .order('created_at', { ascending: false });

      if (authError) {
        results.authenticatedFetch.error = authError.message;
      } else {
        results.authenticatedFetch.success = true;
        results.authenticatedFetch.count = authJobs?.length ?? 0;
        results.jobs = authJobs ?? [];
      }
    } catch (err) {
      results.authenticatedFetch.error = String(err);
    }

    try {
      const anonClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const { data: anonJobs, error: anonError } = await anonClient
        .from('jobs')
        .select('*')
        .eq('status', 'live')
        .order('created_at', { ascending: false });

      if (anonError) {
        results.anonymousFetch.error = anonError.message;
      } else {
        results.anonymousFetch.success = true;
        results.anonymousFetch.count = anonJobs?.length ?? 0;
      }
    } catch (err) {
      results.anonymousFetch.error = String(err);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black"
            style={{
              background: 'linear-gradient(135deg, #A30E15 0%, #780A0F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Database Sync Test
          </h1>
          <p className="text-[#666666] mt-1 font-medium">
            Test job synchronization between dashboard and live site
          </p>
        </div>
        <button
          className="neumorphic-button flex items-center gap-2 px-6 py-3 font-semibold"
          onClick={runTests}
          disabled={isLoading}
        >
          <TestTube className="w-5 h-5" />
          {isLoading ? 'Testing...' : 'Run Tests'}
        </button>
      </div>

      {testResults && (
        <div className="space-y-4">
          <div className="neumorphic-card border border-[#e5e5e5] bg-white p-6">
            <h2 className="text-xl font-black text-black mb-4">Test Results</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#f5f5f5]">
                {testResults.authenticatedFetch.success ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-black mb-1">
                    Authenticated User Fetch (Dashboard)
                  </h3>
                  <p className="text-sm text-[#666666]">
                    {testResults.authenticatedFetch.success ? (
                      <>
                        Successfully fetched{' '}
                        <span className="font-bold text-black">
                          {testResults.authenticatedFetch.count}
                        </span>{' '}
                        live jobs
                      </>
                    ) : (
                      <>
                        Failed to fetch jobs:{' '}
                        {testResults.authenticatedFetch.error}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#f5f5f5]">
                {testResults.anonymousFetch.success ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-black mb-1">
                    Anonymous User Fetch (Live Site Simulation)
                  </h3>
                  <p className="text-sm text-[#666666]">
                    {testResults.anonymousFetch.success ? (
                      <>
                        Successfully fetched{' '}
                        <span className="font-bold text-black">
                          {testResults.anonymousFetch.count}
                        </span>{' '}
                        live jobs
                      </>
                    ) : (
                      <>
                        Failed to fetch jobs: {testResults.anonymousFetch.error}
                      </>
                    )}
                  </p>
                </div>
              </div>

              {testResults.authenticatedFetch.success &&
                testResults.anonymousFetch.success &&
                testResults.authenticatedFetch.count ===
                  testResults.anonymousFetch.count && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-green-50 border border-green-200">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-green-900 mb-1">
                        Sync Working Correctly!
                      </h3>
                      <p className="text-sm text-green-700">
                        Both authenticated and anonymous users can see the same
                        jobs. The database sync is working properly.
                      </p>
                    </div>
                  </div>
                )}

              {testResults.authenticatedFetch.success &&
                (!testResults.anonymousFetch.success ||
                  testResults.authenticatedFetch.count !==
                    testResults.anonymousFetch.count) && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-yellow-900 mb-1">
                        Sync Issue Detected
                      </h3>
                      <p className="text-sm text-yellow-700">
                        Anonymous users cannot fetch jobs properly. This means
                        your live site may have an issue with RLS policies or
                        Supabase configuration.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {testResults.jobs.length > 0 && (
            <div className="neumorphic-card border border-[#e5e5e5] bg-white p-6">
              <h2 className="text-xl font-black text-black mb-4">
                Live Jobs ({testResults.jobs.length})
              </h2>
              <div className="space-y-3">
                {testResults.jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5]"
                  >
                    <h3 className="font-bold text-black">{job.title}</h3>
                    <p className="text-sm text-[#666666] mt-1">
                      {job.location}
                    </p>
                    <p className="text-xs text-[#999999] mt-1">
                      Status: {job.status} • Created:{' '}
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="neumorphic-card border border-[#e5e5e5] bg-white p-6">
            <h2 className="text-xl font-black text-black mb-4">
              Live Site Implementation
            </h2>
            <p className="text-[#666666] mb-4">
              Copy this code to your hamilton-nexus live site to display jobs:
            </p>
            <div className="bg-[#1a1a1a] text-white p-4 rounded-2xl overflow-x-auto text-sm font-mono">
              <pre>{`import { createClient } from '@supabase/supabase-js';

// 1. Add these to hamilton-nexus .env file:
// VITE_SUPABASE_URL=${import.meta.env.VITE_SUPABASE_URL}
// VITE_SUPABASE_ANON_KEY=${import.meta.env.VITE_SUPABASE_ANON_KEY}

// 2. Create Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// 3. Fetch live jobs
const { data: jobs, error } = await supabase
  .from('jobs')
  .select('*')
  .eq('status', 'live')
  .order('created_at', { ascending: false });

// 4. Display jobs in your careers page
jobs?.map(job => (
  <div key={job.id}>
    <h3>{job.title}</h3>
    <p>{job.location}</p>
    <p>{job.salary_range}</p>
    <p>{job.description}</p>
  </div>
));`}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
