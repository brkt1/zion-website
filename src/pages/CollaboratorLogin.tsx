import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaHandshake, FaLock, FaEnvelope } from 'react-icons/fa';
import { adminApi } from '../services/adminApi';

const CollaboratorLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const collaborator = await adminApi.eventCollaborators.login(email, accessCode);
      if (!collaborator) {
        setError('Invalid email or access code. Please check your credentials.');
        return;
      }
      // Store collaborator session in sessionStorage
      sessionStorage.setItem('collaborator_session', JSON.stringify(collaborator));
      navigate(`/collaborator/event/${collaborator.event_id}`);
    } catch (err: any) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
    }}>
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #FFD447 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #FF6F5E 0%, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo area */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}>
              <FaHandshake className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Collaborator Portal</h1>
            <p className="text-white/50 text-sm mt-1">Sign in to view your event dashboard</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                Access Code
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                <input
                  type={showCode ? 'text' : 'password'}
                  required
                  value={accessCode}
                  onChange={e => setAccessCode(e.target.value)}
                  placeholder="Enter your access code"
                  className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showCode ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-gray-900 font-black text-sm tracking-wider transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}
            >
              {loading ? 'Signing in…' : 'Access Event Dashboard'}
            </button>
          </form>

          <p className="text-center text-white/30 text-xs mt-6">
            Access code provided by your event organizer
          </p>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorLogin;
