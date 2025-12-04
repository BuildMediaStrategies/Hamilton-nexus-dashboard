# Jobs Sync Test Results

## Database Status ✅

**Total Jobs in Database:** 12
**Live Jobs:** 12
**Draft Jobs:** 0

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

## Next Steps

1. Verify hamilton-nexus site has the correct Supabase environment variables
2. Check that hamilton-nexus is fetching jobs from Supabase (not from static data)
3. Test with browser DevTools Network tab to see actual API calls
4. Verify no service worker or build-time caching preventing updates
