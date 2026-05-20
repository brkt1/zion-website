import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaUserTie, FaBuilding, FaCheckCircle, FaStar, FaEnvelope, FaMapMarkerAlt, FaSignOutAlt, FaCalendarAlt, FaHandshake, FaSpinner } from 'react-icons/fa';
import { yenegeUnityApi } from '../../services/yenegeUnityApi';
import { YenegeUnityAttendee, YenegeUnityMatch } from '../../types/yenegeUnity';

export default function YenegeUnityPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Login State
  const [email, setEmail] = useState('');
  
  // Dashboard State
  const [attendee, setAttendee] = useState<YenegeUnityAttendee | null>(null);
  const [matches, setMatches] = useState<YenegeUnityMatch[]>([]);

  // Local state for debouncing notes
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const loggedInAttendee = await yenegeUnityApi.loginAttendee(email);
      setAttendee(loggedInAttendee);
      setIsLoggedIn(true);
      
      // Fetch their matches
      const fetchedMatches = await yenegeUnityApi.getAttendeeMatches(loggedInAttendee.id);
      setMatches(fetchedMatches);
      
      // Init local notes
      const initialNotes: Record<string, string> = {};
      fetchedMatches.forEach(m => {
        initialNotes[m.id] = m.notes || '';
      });
      setLocalNotes(initialNotes);
      
    } catch (err: any) {
      setError(err.message || 'ትክክል ያልሆነ ኢሜይል ወይም ኮድ (Invalid credentials)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAttendee(null);
    setMatches([]);
    setEmail('');
  };

  const updateMatchStatus = async (id: string, status: YenegeUnityMatch['status']) => {
    try {
      // Optimistic update
      setMatches(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      // API call
      await yenegeUnityApi.updateMatch(id, { status });
    } catch (err) {
      console.error('Failed to update status', err);
      // Revert in case of failure (could add a toast notification here)
      alert('Network error. Failed to update status.');
    }
  };

  const handleNoteBlur = async (id: string) => {
    const note = localNotes[id];
    const originalMatch = matches.find(m => m.id === id);
    
    if (originalMatch && originalMatch.notes !== note) {
      try {
        await yenegeUnityApi.updateMatch(id, { notes: note });
        setMatches(prev => prev.map(m => m.id === id ? { ...m, notes: note } : m));
      } catch (err) {
        console.error('Failed to update notes', err);
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-amber-500 selection:text-black font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl p-8 relative shadow-2xl z-10 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white tracking-widest uppercase">Yenege Unity</h1>
            <p className="text-amber-500 font-bold tracking-widest text-xs mt-1">አባል መግቢያ (Portal)</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">ኢሜይል (Email)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white outline-none transition"
                  placeholder="name@company.com"
                />
              </div>
            </div>



            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : 'ወደ ዳሽቦርድ ይግቡ'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/yenege-unity" className="text-xs text-gray-500 hover:text-white transition">
              ← ወደ ማረፊያ ገጽ ይመለሱ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20 selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <nav className="bg-neutral-950 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-lg font-black tracking-widest uppercase">YENEGE UNITY</span>
            <span className="hidden md:inline-block px-2 py-0.5 bg-amber-500/10 text-amber-500 text-xs font-bold rounded">LIVE</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold">{attendee?.fullName}</p>
              <p className="text-xs text-gray-400">{attendee?.companyName}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white transition"
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pt-10 space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-neutral-900 border border-amber-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
          
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 relative z-10">እንኳን ደህና መጡ!</h1>
          <p className="text-gray-400 text-lg max-w-2xl relative z-10 leading-relaxed font-light">
            የእኛ ቡድን የእርስዎን መረጃ እና ፍላጎት በጥልቀት በማጥናት ዛሬ ሊያገኟቸው የሚገቡ <span className="text-white font-bold">{matches.length}</span> ዋና ዋና ሰዎችን መርጦ አዘጋጅቶልዎታል።
          </p>

          <div className="flex flex-wrap gap-4 mt-8 relative z-10">
            <div className="flex items-center gap-2 bg-black/50 border border-white/5 px-4 py-2 rounded-xl">
              <FaCalendarAlt className="text-amber-500" />
              <span className="text-sm font-bold">ዛሬ (Today)</span>
            </div>
            <div className="flex items-center gap-2 bg-black/50 border border-white/5 px-4 py-2 rounded-xl">
              <FaMapMarkerAlt className="text-amber-500" />
              <span className="text-sm font-bold">ስካይላይት ሆቴል</span>
            </div>
          </div>
        </div>

        {/* Agenda Title */}
        <div className="pt-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaHandshake className="text-amber-500" /> የእርስዎ ቀጠሮዎች (Your Matches)
          </h2>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900 border border-white/5 rounded-3xl">
            <p className="text-gray-500">ቀጠሮዎችዎ ገና አልተመደቡም (Matches not assigned yet)።</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => {
              const profile = match.matchedAttendee;
              if (!profile) return null;

              return (
                <div key={match.id} className="bg-neutral-900 border border-white/10 rounded-2xl p-6 flex flex-col hover:border-white/20 transition-all group relative">
                  
                  {/* Match Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-black rounded-full border border-white/10 flex items-center justify-center text-amber-500 font-bold text-xl overflow-hidden">
                      {profile.profilePhoto ? (
                        <img src={profile.profilePhoto} alt={profile.fullName} className="w-full h-full object-cover" />
                      ) : (
                        profile.fullName.charAt(0)
                      )}
                    </div>
                    <div className="bg-black/50 border border-white/5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                      ቀጠሮ #{index + 1}
                    </div>
                  </div>

                  {/* Match Info */}
                  <h3 className="text-xl font-bold text-white">{profile.fullName}</h3>
                  <p className="text-amber-500 font-medium text-sm flex items-center gap-1.5 mt-1">
                    <FaUserTie size={12} /> {profile.jobTitle}
                  </p>
                  <p className="text-gray-400 text-sm flex items-center gap-1.5 mt-1">
                    <FaBuilding size={12} /> {profile.companyName}
                  </p>

                  {/* Why Match */}
                  <div className="mt-5 p-3 bg-black/40 rounded-xl border border-white/5 flex-grow">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">ኢንዱስትሪ / አቅርቦት</p>
                    <p className="text-sm text-gray-300 leading-relaxed mb-2"><span className="text-amber-500">Industry:</span> {profile.industry}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">እነሱ የሚፈልጉት (Opportunities Sought)</p>
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">{profile.opportunitiesSought}</p>
                  </div>

                  {/* Status Controls */}
                  <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
                    
                    {/* Notes Input */}
                    <div>
                      <textarea
                        value={localNotes[match.id] || ''}
                        onChange={(e) => setLocalNotes({ ...localNotes, [match.id]: e.target.value })}
                        onBlur={() => handleNoteBlur(match.id)}
                        placeholder="የግል ማስታወሻ ይጻፉ (Private Notes)..."
                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white focus:ring-1 focus:ring-amber-500 resize-none h-16 placeholder:text-gray-700"
                      />
                    </div>

                    {/* Status Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateMatchStatus(match.id, 'met')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                          match.status === 'met' || match.status === 'closed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        <FaCheckCircle /> አግኝቼዋለሁ
                      </button>
                      <button
                        onClick={() => updateMatchStatus(match.id, 'follow_up')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                          match.status === 'follow_up'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        <FaStar /> Follow up
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
