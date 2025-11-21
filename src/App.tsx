import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { PillNavigation } from './components/layout/PillNavigation';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { RolesPage } from './components/roles/RolesPage';
import { CandidatesPage } from './components/candidates/CandidatesPage';
import { ClientsPage } from './components/clients/ClientsPage';
import { SurveysPage } from './components/surveys/SurveysPage';
import { DocumentsPage } from './components/documents/DocumentsPage';
import { InvoicesPage } from './components/invoices/InvoicesPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import TestSupabase from './Testsupabase';
import { supabase } from '@/lib/supabaseClient';
import LoginPage from '@/components/auth/LoginPage';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const shouldRemember = localStorage.getItem('rememberMe');

      if (shouldRemember === 'false') {
        await supabase.auth.signOut();
        if (!isMounted) return;
        setSession(null);
        setAuthLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setSession(data.session);
      setAuthLoading(false);
    }

    initAuth();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('rememberMe');
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[#666666] font-medium">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <LoginPage
        onAuthenticated={async () => {
          const { data } = await supabase.auth.getSession();
          setSession(data.session);
        }}
      />
    );
  }

  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : '/';

  if (pathname === '/test-supabase') {
    return (
      <div className="min-h-screen bg-white">
        <main className="pt-8">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
            <TestSupabase />
          </div>
        </main>
      </div>
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
          {activePage === 'surveys' && <SurveysPage />}
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
