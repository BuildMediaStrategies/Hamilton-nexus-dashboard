import { FormEvent, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface LoginPageProps {
  onAuthenticated: () => void;
}

const ALLOWED_EMAILS = [
  'jj@byjohnson.co.uk',
  'myles@hamiltonrecruitment.co.uk'
];

export default function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const shouldRemember = localStorage.getItem('rememberMe');
    if (shouldRemember === 'false') {
      void supabase.auth.signOut();
    }
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    if (data.session && data.user) {
      const userEmail = data.user.email?.toLowerCase();

      if (!userEmail || !ALLOWED_EMAILS.includes(userEmail)) {
        await supabase.auth.signOut();
        setError('This dashboard is invite-only.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('rememberMe', rememberMe.toString());

      if (!rememberMe) {
        window.addEventListener('beforeunload', async () => {
          await supabase.auth.signOut();
        });
      }

      setIsLoading(false);
      setError(null);
      onAuthenticated();
    } else {
      setIsLoading(false);
      setError('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md neumorphic-card border border-[#e5e5e5] bg-white p-6 sm:p-8">
        <h1
          className="text-2xl sm:text-3xl font-black mb-6 text-center"
          style={{
            background: 'linear-gradient(135deg, #A30E15 0%, #780A0F 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Sign in to Hamilton Nexus
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-black">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-black">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="w-4 h-4 text-[#A30E15] border-[#e5e5e5] rounded focus:ring-2 focus:ring-[#A30E15]"
            />
            <label htmlFor="rememberMe" className="text-sm text-[#666666] font-medium cursor-pointer">
              Remember me
            </label>
          </div>
          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full neumorphic-button px-4 py-2.5 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

