import { useEffect, useState } from 'react';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { PillNavigation } from './components/layout/PillNavigation';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { RolesPage } from './components/roles/RolesPage';
import { CandidatesPage } from './components/candidates/CandidatesPage';
import { ClientsPage } from './components/clients/ClientsPage';
import { DiaryPage } from './components/diary/DiaryPage';
import { DocumentsPage } from './components/documents/DocumentsPage';
import { InvoicesPage } from './components/invoices/InvoicesPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import LoginPage from '@/components/auth/LoginPage';

const ALLOWED_EMAILS = [
  'jj@buildmediastrategies.com',
  'myles.hamilton@hamilton-nexus.co.uk'
];

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        if (!isMounted) return;
        setSession(null);
        setAuthLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (data.session) {
        const userEmail = data.session.user.email?.toLowerCase();
        if (!userEmail || !ALLOWED_EMAILS.includes(userEmail)) {
          await supabase.auth.signOut();
          setSession(null);
          setAuthError('This dashboard is invite-only.');
          setAuthLoading(false);
          return;
        }
      }

      setSession(data.session);
      setAuthLoading(false);
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: sub } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, newSession: Session | null) => {
        if (!isMounted) return;

        if (newSession) {
          const userEmail = newSession.user.email?.toLowerCase();
          if (!userEmail || !ALLOWED_EMAILS.includes(userEmail)) {
            await supabase.auth.signOut();
            setSession(null);
            setAuthError('This dashboard is invite-only.');
            return;
          }
        }

        setSession(newSession);
        if (newSession) {
          setAuthError(null);
        }
      });

      return () => {
        isMounted = false;
        sub.subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <LoginPage
        onAuthenticated={async () => {
          if (!isSupabaseConfigured) return;
          const { data } = await supabase.auth.getSession();
          setSession(data.session);
        }}
        isLoading={true}
        configError={!isSupabaseConfigured}
        authError={null}
      />
    );
  }

  if (!session) {
    return (
      <LoginPage
        onAuthenticated={async () => {
          if (!isSupabaseConfigured) return;
          const { data } = await supabase.auth.getSession();
          setSession(data.session);
        }}
        isLoading={false}
        configError={!isSupabaseConfigured}
        authError={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PillNavigation
        activePage={activePage}
        onNavigate={setActivePage}
        userEmail={session.user.email ?? 'User'}
        onLogout={handleLogout}
      />
      <main className="pt-24">
        <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
          {activePage === 'dashboard' && <DashboardPage onNavigate={setActivePage} />}
          {activePage === 'roles' && <RolesPage />}
          {activePage === 'candidates' && <CandidatesPage />}
          {activePage === 'clients' && <ClientsPage />}
          {activePage === 'diary' && <DiaryPage />}
          {activePage === 'documents' && <DocumentsPage />}
          {activePage === 'invoices' && <InvoicesPage />}
          {activePage === 'reports' && <ReportsPage />}
          {activePage === 'settings' && (
            <SettingsPage userEmail={session.user.email ?? 'User'} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
