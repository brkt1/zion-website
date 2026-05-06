import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isAdmin, isCommissionSeller, isSponsorshipManager, isTicketScanner } from '../../services/auth';
import { supabase } from '../../services/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setError('You do not have access to this area. Please contact an administrator.');
    }
    const handleAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const admin = await isAdmin();
        const manager = await isSponsorshipManager();
        const seller = await isCommissionSeller();
        const scanner = await isTicketScanner();
        if (!admin && !seller && !scanner && !manager) {
          await supabase.auth.signOut();
          setError('You do not have access. Please contact an administrator.');
          setLoading(false); setGoogleLoading(false);
          return;
        }
        if (admin) navigate('/admin/dashboard');
        else if (manager) navigate('/admin/sponsorship-department');
        else if (seller) navigate('/admin/seller-dashboard');
        else if (scanner) navigate('/admin/scanner-dashboard');
      }
    };
    handleAuthCallback();
  }, [searchParams, navigate]);

  const redirectUser = async () => {
    const admin = await isAdmin();
    const manager = await isSponsorshipManager();
    const seller = await isCommissionSeller();
    const scanner = await isTicketScanner();
    if (!admin && !seller && !scanner && !manager) {
      await supabase.auth.signOut();
      setError('You do not have access. Please contact an administrator.');
      setLoading(false); setGoogleLoading(false);
      return;
    }
    if (admin) navigate('/admin/dashboard');
    else if (manager) navigate('/admin/sponsorship-department');
    else if (seller) navigate('/admin/seller-dashboard');
    else if (scanner) navigate('/admin/scanner-dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) await redirectUser();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/admin/login` },
      });
      if (error) {
        if (error.message?.includes('not enabled') || error.message?.includes('validation_failed')) {
          throw new Error('Google Sign-In is not enabled. Please contact your administrator.');
        }
        throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left Brand Panel ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-2/5 bg-[#1C2951] relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-[#FFD447]/8 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-[#FF6F5E]/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-white/3 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[60px] pointer-events-none" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FFD447] to-[#FF6F5E] flex items-center justify-center shadow-xl shadow-[#FF6F5E]/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-black text-xl tracking-tight leading-none">YENEGE</p>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">Admin Hub</p>
            </div>
          </div>
        </div>

        {/* Center: Hero text */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 rounded-full bg-[#FFD447] animate-pulse" />
            <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Secure Portal</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight mb-5">
            Manage<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD447] to-[#FF6F5E]">Everything</span>
            <br />from here.
          </h1>
          <p className="text-white/50 text-sm font-medium leading-relaxed max-w-xs">
            Your central command for events, ticketing, applications, content and team management.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['🎟️ Ticketing', '📊 Analytics', '👥 Team', '📝 Content', '📋 Applications'].map(f => (
              <span key={f} className="bg-white/8 border border-white/10 text-white/70 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom: Stats strip */}
        <div className="relative z-10 border-t border-white/10 pt-8">
          <div className="grid grid-cols-3 gap-6">
            {[
              { value: '100%', label: 'Secure' },
              { value: '24/7', label: 'Uptime' },
              { value: '∞', label: 'Scale' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ──────────────────────────────────── */}
      <div className="flex-1 bg-[#f8f9fa] flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)',
          backgroundSize: '28px 28px'
        }} />

        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD447] to-[#FF6F5E] flex items-center justify-center shadow-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <div>
            <p className="text-[#1C2951] font-black text-lg tracking-tight">YENEGE</p>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Admin Hub</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/60 border border-gray-100 p-8 sm:p-10">

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-[#1C2951] tracking-tight">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-1.5 font-medium">Sign in to your admin account</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </div>
                <p className="text-sm text-red-700 font-medium leading-snug">{error}</p>
              </div>
            )}

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-5 border-2 border-gray-200 rounded-2xl text-gray-700 font-bold text-sm hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFD447]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-6 group"
            >
              {googleLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">or email</span>
              </div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="admin-email" className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD447]/40 focus:border-[#FFD447]/60 focus:bg-white transition-all duration-200"
                  placeholder="admin@yenege.com"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD447]/40 focus:border-[#FFD447]/60 focus:bg-white transition-all duration-200"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-[#1C2951] to-[#2d3d6b] hover:from-[#2d3d6b] hover:to-[#1C2951] focus:outline-none focus:ring-2 focus:ring-[#1C2951]/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-[#1C2951]/20 hover:shadow-xl hover:shadow-[#1C2951]/30 active:scale-[0.98] mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Footer note */}
            <p className="text-center text-xs text-gray-400 font-medium mt-7">
              Access restricted to authorized staff only.
            </p>
          </div>

          {/* Bottom badge */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#FFD447] to-[#FF6F5E] flex items-center justify-center shadow-sm">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
            <span className="text-xs text-gray-400 font-medium">Secured by Supabase Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
