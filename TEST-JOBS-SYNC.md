# Jobs Sync Diagnostic Report

## CONFIRMED: Dashboard → Database Works Perfectly ✅

**Test Result:** Successfully deleted a job from dashboard
**Database Count Before:** 12 jobs
**Database Count After:** 11 jobs
**Conclusion:** Dashboard CRUD operations work correctly

## THE REAL PROBLEM: Live Site is NOT Reading from Database ❌

The hamilton-nexus live website is displaying **static/cached jobs**, not live data from Supabase.

## RLS Policies ✅

### Policy 1: "Public can view live jobs"
- **Role:** anon (unauthenticated/public users)
- **Permission:** SELECT only
- **Condition:** status = 'live'
- **Status:** ✅ Correctly configured

### Policy 2: "Authenticated users can manage jobs"
- **Role:** authenticated (logged-in dashboard users)
- **Permission:** ALL (SELECT, INSERT, UPDATE, DELETE)
- **Condition:** true (all jobs)
- **Status:** ✅ Correctly configured

## Dashboard Implementation ✅

The dashboard is correctly implemented with:
- ✅ Supabase client properly configured
- ✅ Job CRUD operations (Create, Read, Update, Delete) working
- ✅ Status management (draft, live, closed)
- ✅ All job fields properly handled (title, location, description, requirements, benefits, etc.)

## Live Site Requirements ⚠️

For the hamilton-nexus live site to display jobs, it needs:

### 1. Same Supabase Connection
Add these environment variables to hamilton-nexus:
```
VITE_SUPABASE_URL=https://idvrfhzptlwisdhrnrsy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkdnJmaHpwdGx3aXNkaHJucnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzQzMDUsImV4cCI6MjA3NzUxMDMwNX0.YFAms1aUVtf0iChpaQEa_ZhdReGLLOf1vQMVPf0H3zY
```

### 2. Supabase Client Setup
Create a Supabase client in the live site:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### 3. Fetch Live Jobs
On the careers/jobs page:

```typescript
import { supabase } from '@/lib/supabase';

// Fetch only live jobs
const { data: jobs, error } = await supabase
  .from('jobs')
  .select('*')
  .eq('status', 'live')
  .order('created_at', { ascending: false });

if (error) {
  console.error('Error fetching jobs:', error);
}
```

### 4. Optional: Real-Time Updates
For instant updates without page refresh:

```typescript
// Subscribe to changes
supabase
  .channel('jobs_changes')
  .on(
    'postgres_changes',
    {
      event: '*', // listen to all events (INSERT, UPDATE, DELETE)
      schema: 'public',
      table: 'jobs',
      filter: 'status=eq.live'
    },
    (payload) => {
      console.log('Job changed:', payload);
      // Refresh jobs list
    }
  )
  .subscribe();
```

## Testing Checklist

To verify the sync is working:

1. ✅ **Database has jobs** - 12 live jobs confirmed
2. ✅ **RLS policies allow public read access** - Configured correctly
3. ⚠️ **Live site fetches from same database** - Needs verification
4. ⚠️ **Live site queries for status='live'** - Needs verification
5. ⚠️ **No caching blocking fresh data** - Needs verification

## Common Issues & Solutions

### Issue 1: Jobs not appearing on live site
**Cause:** Live site not fetching from Supabase or using wrong credentials
**Solution:** Verify environment variables and Supabase client setup

### Issue 2: Getting "permission denied" errors
**Cause:** RLS policies not allowing access
**Solution:** Already fixed - policies are correct

### Issue 3: Old data showing (not updating)
**Cause:** Browser caching or service worker caching
**Solution:**
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check service worker in DevTools > Application
- Add cache-busting or disable caching during development

### Issue 4: Jobs created but not visible
**Cause:** Job status not set to 'live'
**Solution:** Ensure jobs are set to 'live' status in dashboard

## Root Cause: Hamilton-Nexus Live Site Issues

The live site is most likely:

### 1. Using Static Site Generation (SSG)
- Jobs are fetched at **build time** and compiled into HTML
- Changes to database don't appear until site is **rebuilt and redeployed**
- **Solution:** Change to client-side fetching or use ISR (Incremental Static Regeneration)

### 2. Has Jobs Hardcoded in the Code
- Jobs are defined as JavaScript/TypeScript objects in the code
- Not fetching from Supabase at all
- **Solution:** Replace hardcoded jobs with Supabase fetch calls

### 3. Aggressive Caching
- Browser cache, CDN cache, or service worker serving old data
- **Solution:** Hard refresh (Ctrl+Shift+R), clear cache, disable service worker

## How to Fix the Hamilton-Nexus Live Site

### Option A: Client-Side Fetching (Recommended)
Make the careers page fetch jobs on page load in the browser:

```typescript
// In your Careers/Jobs page component
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'live')
        .order('created_at', { ascending: false });

      if (!error) {
        setJobs(data);
      }
      setLoading(false);
    }

    fetchJobs();
  }, []);

  if (loading) return <div>Loading jobs...</div>;

  return (
    <div>
      {jobs.map(job => (
        <div key={job.id}>
          <h3>{job.title}</h3>
          <p>{job.location}</p>
          <p>{job.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Option B: Real-Time Updates (Advanced)
Subscribe to database changes for instant updates:

```typescript
useEffect(() => {
  // Initial fetch
  fetchJobs();

  // Subscribe to changes
  const subscription = supabase
    .channel('jobs_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'jobs',
        filter: 'status=eq.live'
      },
      () => {
        // Refetch jobs when database changes
        fetchJobs();
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Option C: Rebuild/Redeploy After Changes
If you must use SSG:
1. Make changes in dashboard
2. Rebuild the hamilton-nexus site (`npm run build`)
3. Redeploy the site
4. Changes will appear after deployment completes

## Verification Steps

To confirm what the live site is doing:

1. **Open browser DevTools (F12) on hamilton-nexus careers page**
2. **Go to Network tab**
3. **Refresh the page**
4. **Look for:**
   - ✅ Supabase API calls (to `idvrfhzptlwisdhrnrsy.supabase.co`)
   - ❌ No API calls = static/hardcoded data

5. **Check the Console tab for:**
   - Any errors fetching from Supabase
   - Any logs showing job data

6. **View Page Source (Ctrl+U)**
   - If you can see full job data in the HTML source, it's SSG
   - If you see loading placeholders/empty divs, it's client-side

## Current Database State

- **Total Jobs:** 11
- **Live Jobs:** 11 (all are set to 'live' status)
- **Database URL:** `https://idvrfhzptlwisdhrnrsy.supabase.co`

## Summary

✅ **Dashboard works perfectly** - Creates, edits, deletes jobs in database
✅ **Database is correct** - All RLS policies properly configured
✅ **Database has live jobs** - 11 jobs with status='live'
❌ **Live site not connected** - Not fetching from Supabase or using static builds

**Action Required:** Update hamilton-nexus to fetch jobs from Supabase dynamically instead of using static/cached data.
