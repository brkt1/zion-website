import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserTie, FaBuilding, FaCheckCircle, FaStar, FaEnvelope, FaMapMarkerAlt, FaSignOutAlt, FaCalendarAlt, FaHandshake, FaSpinner, FaChevronDown, FaPhoneAlt, FaLock, FaUnlock, FaLightbulb, FaUsers } from 'react-icons/fa';
import { yenegeUnityApi } from '../../services/yenegeUnityApi';
import { YenegeUnityAttendee, YenegeUnityEvent, YenegeUnityMatch } from '../../types/yenegeUnity';

export default function YenegeUnityPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Login State
  const [email, setEmail] = useState('');
  
  // Dashboard State
  const [attendee, setAttendee] = useState<YenegeUnityAttendee | null>(null);
  const [matches, setMatches] = useState<YenegeUnityMatch[]>([]);
  const [event, setEvent] = useState<YenegeUnityEvent | null>(null);

  // Computed: are we on/after the event day? (contacts unlock)
  const isEventDay = event ? new Date() >= new Date(event.date) : false;

  // Computed matches
  const eventMatches = event && event.attendeeIds ? matches.filter(m => event.attendeeIds!.includes(m.matchedAttendeeId)) : [];
  const generalMatchesCount = matches.length;

  // Local state for debouncing notes
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  // Track which match card is expanded on mobile
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

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

      // Fetch events and find which one this attendee is assigned to
      const events = await yenegeUnityApi.getEvents();
      const assignedEvent = events.find(ev => (ev.attendeeIds ?? []).includes(loggedInAttendee.id)) ?? null;
      setEvent(assignedEvent);
      
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
    setEvent(null);
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
      // Revert in case of failure
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
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Decorative Glow Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-900/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2a0000] to-[#150000] border border-amber-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(217,119,6,0.15)]">
              <span className="text-amber-500 font-serif font-black text-2xl tracking-widest">YU</span>
            </div>
            <h1 className="text-2xl font-black text-white font-serif tracking-widest uppercase">Yenege Unity</h1>
            <p className="text-xs text-amber-500/70 mt-1 tracking-widest uppercase">Executive Portal Access</p>
          </div>

          <div className="bg-[#150000] border border-amber-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
            
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl text-center font-bold mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Registered Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/50" size={14} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-black border border-amber-500/20 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white outline-none transition-all text-sm font-medium placeholder-gray-600"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(217,119,6,0.2)]"
              >
                {isLoading ? <FaSpinner className="animate-spin" size={14} /> : 'Unlock Portal'}
              </button>
            </form>
          </div>

          <div className="text-center mt-5">
            <Link to="/yenege-unity" className="text-sm text-gray-500 hover:text-amber-500 transition-colors">
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20">
      {/* Sticky Header */}
      <nav className="bg-[#150000]/80 backdrop-blur-md border-b border-amber-500/10 sticky top-0 z-50 h-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2a0000] to-[#150000] border border-amber-500/30 flex items-center justify-center text-amber-500 font-serif font-black text-xs tracking-widest shadow-[0_0_15px_rgba(217,119,6,0.15)]">YU</div>
            <span className="text-sm font-bold text-white tracking-widest uppercase hidden sm:block">Yenege Unity</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-amber-400 leading-tight tracking-wide">{attendee?.fullName}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{attendee?.companyName}</p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-900/40 text-gray-400 hover:text-red-400 transition-colors border border-transparent hover:border-red-900/50" title="Logout">
              <FaSignOutAlt size={14} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">

        {/* Premium Welcome Banner */}
        <div className="bg-gradient-to-br from-[#2a0000] to-[#150000] border border-amber-500/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full mb-3">
              <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest">{event?.title || 'Executive Summit'}</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight text-white font-serif tracking-wide">
              Welcome, <span className="text-amber-500">{attendee?.fullName?.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-300 text-sm mt-3 font-medium max-w-lg leading-relaxed">
              You have <span className="text-amber-400 font-black text-lg bg-amber-500/10 px-2 py-0.5 rounded">{eventMatches.length}</span> curated connections unlocked for today's private session.
            </p>
            
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center gap-2 bg-black/40 border border-amber-500/10 px-4 py-2 rounded-xl">
                <FaCalendarAlt size={12} className="text-amber-500" />
                <span className="text-xs font-bold text-gray-200">{event ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-amber-500/10 px-4 py-2 rounded-xl">
                <FaMapMarkerAlt size={12} className="text-amber-500" />
                <span className="text-xs font-bold text-gray-200">{event?.location || 'Venue TBD'}</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                isEventDay ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(217,119,6,0.15)]' : 'bg-black/40 border-gray-800 text-gray-400'
              }`}>
                {isEventDay ? <FaUnlock size={12} /> : <FaLock size={12} />}
                {isEventDay ? 'Dossiers Unlocked' : 'Dossiers Unlock on Event Day'}
              </div>
            </div>
          </div>
        </div>

        {/* General Matching Summary */}
        {generalMatchesCount > eventMatches.length && (
          <div className="bg-[#150000] border border-amber-500/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] translate-x-1/3 -translate-y-1/3" />
            <div className="relative z-10">
              <h3 className="font-black text-amber-500 text-[11px] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <FaUsers className="text-amber-500" /> Broad Network Potential
              </h3>
              <p className="text-sm text-gray-300 font-medium">Our algorithm has mapped <strong className="text-amber-400 font-black">{generalMatchesCount}</strong> total highly-compatible connections across the ecosystem.</p>
              <p className="text-xs text-gray-500 mt-1">You will be introduced to your remaining {generalMatchesCount - eventMatches.length} matches at future summits.</p>
            </div>
          </div>
        )}

        {/* Networking Tips - compact grid */}
        <div className="bg-[#150000] border border-amber-500/10 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <FaLightbulb className="text-amber-500" size={14} />
            <p className="text-xs font-black text-amber-500/80 uppercase tracking-widest">Executive Protocol</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { e: '🎯', t: 'Be specific about what value you can offer.' },
              { e: '🤝', t: 'Exchange contacts right after a good conversation.' },
              { e: '✍️', t: 'Add a private note to dossiers while it\'s fresh.' },
              { e: '💡', t: 'Give before you take — lead with how you can help.' },
            ].map(({ e, t }) => (
              <div key={t} className="flex items-start gap-2 text-xs text-gray-400 font-medium bg-[#2a0000]/40 p-2.5 rounded-xl border border-amber-500/5">
                <span className="opacity-80">{e}</span><span className="leading-relaxed">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Matches Header */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <FaHandshake className="text-amber-500" size={14} />
            </div>
            <h2 className="text-xl font-serif font-black text-white tracking-wide">Your {eventMatches.length} Curated Connections</h2>
          </div>
        </div>

        {eventMatches.length === 0 ? (
          <div className="text-center py-16 bg-[#150000] border border-amber-500/10 rounded-3xl shadow-xl">
            <FaHandshake className="text-amber-500/20 mx-auto mb-4" size={32} />
            <p className="text-gray-300 font-bold text-sm tracking-wide">Your executive dossiers are being processed.</p>
            <p className="text-xs text-amber-500/60 mt-1 uppercase tracking-widest">Please check back shortly</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {eventMatches.map((match, index) => {
              const profile = match.matchedAttendee;
              if (!profile) return null;
              const isExpanded = expandedMatchId === match.id;

              return (
                <div key={match.id} className="bg-[#150000] border border-amber-500/20 rounded-3xl overflow-hidden hover:border-amber-500/50 hover:shadow-[0_0_25px_rgba(217,119,6,0.1)] transition-all duration-300 group">
                  {/* Card Top */}
                  <div className="p-6 relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <FaUserTie size={60} />
                    </div>
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2a0000] to-[#150000] border border-amber-500/30 flex items-center justify-center text-amber-500 font-serif font-black text-xl flex-shrink-0 shadow-inner">
                        {profile.profilePhoto
                          ? <img src={profile.profilePhoto} alt={profile.fullName} className="w-full h-full object-cover rounded-2xl" />
                          : profile.fullName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-white text-lg leading-tight tracking-wide">{profile.fullName}</h3>
                          <span className="text-[10px] font-black text-amber-900 bg-amber-500 px-2 py-0.5 rounded-full flex-shrink-0 shadow-sm">#{index + 1}</span>
                        </div>
                        <p className="text-xs text-amber-500 font-bold mt-1 tracking-wider uppercase">{profile.jobTitle}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">{profile.companyName}</p>
                      </div>
                    </div>

                    {/* Contact buttons */}
                    <div className="mt-5 flex gap-3">
                      {isEventDay ? (
                        <>
                          <a href={`tel:${profile.phone}`} className="flex-1 bg-[#2a0000] hover:bg-amber-500 hover:text-black border border-amber-500/20 text-gray-300 py-2.5 rounded-xl text-xs font-black tracking-wide flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:scale-105 active:scale-95">
                            <FaPhoneAlt size={10} /> {profile.phone}
                          </a>
                          <a href={`mailto:${profile.email}`} className="flex-1 bg-[#2a0000] hover:bg-amber-500 hover:text-black border border-amber-500/20 text-gray-300 py-2.5 rounded-xl text-xs font-black tracking-wide flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:scale-105 active:scale-95">
                            <FaEnvelope size={10} /> Email
                          </a>
                        </>
                      ) : (
                        <div className="flex-1 bg-[#2a0000]/50 border border-dashed border-amber-500/20 py-3 rounded-xl flex items-center justify-center gap-2 text-gray-500 text-xs font-bold tracking-wide">
                          <FaLock size={10} className="text-amber-500/50" /> Contacts unlock on event day
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <div className="border-t border-amber-500/10 bg-black/40">
                    <button
                      onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                      className="w-full flex items-center justify-between px-6 py-4 text-xs font-black tracking-widest uppercase text-amber-500/70 hover:text-amber-500 hover:bg-[#2a0000]/30 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Dossier' : 'View Full Dossier'}</span>
                      <FaChevronDown className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} size={10} />
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#150000] p-3 rounded-xl border border-amber-500/10">
                            <p className="text-[9px] text-amber-500/50 uppercase font-black tracking-widest mb-1.5">Industry Sector</p>
                            <p className="text-sm font-bold text-gray-200">{profile.industry} {profile.participantType && <span className="text-amber-500 text-xs tracking-wider">· {profile.participantType}</span>}</p>
                          </div>
                          <div className="bg-[#150000] p-3 rounded-xl border border-amber-500/10">
                            <p className="text-[9px] text-amber-500/50 uppercase font-black tracking-widest mb-1.5">Primary Objective</p>
                            <p className="text-xs text-gray-300 font-medium leading-relaxed">{profile.opportunitiesSought || 'Executive Networking'}</p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[9px] text-amber-500/50 uppercase font-black tracking-widest ml-1">Private Notes</p>
                          <textarea
                            value={localNotes[match.id] || ''}
                            onChange={(e) => setLocalNotes({ ...localNotes, [match.id]: e.target.value })}
                            onBlur={() => handleNoteBlur(match.id)}
                            placeholder="Add confidential notes from your meeting..."
                            className="w-full bg-[#150000] border border-amber-500/20 rounded-xl p-3.5 text-sm text-gray-200 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none h-20 outline-none placeholder-gray-600 transition-all"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => updateMatchStatus(match.id, 'met')}
                            className={`flex-1 py-3 text-xs font-black tracking-wide uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                              match.status === 'met' || match.status === 'closed'
                                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(217,119,6,0.3)] scale-105'
                                : 'bg-[#2a0000] text-amber-500/70 border border-amber-500/20 hover:border-amber-500 hover:text-amber-500'
                            }`}
                          >
                            <FaCheckCircle size={12} /> {match.status === 'met' || match.status === 'closed' ? 'Met & Confirmed' : 'Mark as Met'}
                          </button>
                          <button
                            onClick={() => updateMatchStatus(match.id, 'follow_up')}
                            className={`flex-1 py-3 text-xs font-black tracking-wide uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                              match.status === 'follow_up'
                                ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105'
                                : 'bg-[#2a0000] text-gray-400 border border-gray-600 hover:border-white hover:text-white'
                            }`}
                          >
                            <FaStar size={12} /> Priority Follow-Up
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
}
