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
      <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] via-white to-[#fdfbf7] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4a0e17]/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#4a0e17] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-black text-lg">YU</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">Yenege Unity</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to your attendee portal</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl text-center font-medium mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a0e17]/20 focus:border-[#4a0e17] text-gray-900 outline-none transition-all text-sm"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#4a0e17] hover:bg-[#6b1422] text-white font-bold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? <FaSpinner className="animate-spin" size={14} /> : 'Access My Portal'}
              </button>
            </form>
          </div>

          <div className="text-center mt-5">
            <Link to="/yenege-unity" className="text-sm text-gray-400 hover:text-[#4a0e17] transition-colors">
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      {/* Sticky Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#4a0e17] flex items-center justify-center text-white font-black text-[10px]">YU</div>
            <span className="text-sm font-bold text-[#4a0e17] hidden sm:block">Yenege Unity</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{attendee?.fullName}</p>
              <p className="text-[10px] text-gray-400">{attendee?.companyName}</p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
              <FaSignOutAlt size={14} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-5">

        {/* Welcome Banner */}
        <div className="bg-[#4a0e17] rounded-2xl p-6 relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/15 rounded-full blur-[50px]" />
          <div className="relative z-10">
            <p className="text-[#d4af37] text-xs font-bold uppercase tracking-widest mb-1">{event?.title || 'Yenege Unity Summit'}</p>
            <h1 className="text-xl sm:text-2xl font-black leading-tight">Hello, {attendee?.fullName?.split(' ')[0]} 👋</h1>
            <p className="text-white/70 text-sm mt-2">
              You have <span className="text-[#d4af37] font-black text-base">{eventMatches.length}</span> curated connections waiting for you today.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg">
                <FaCalendarAlt size={11} className="text-[#d4af37]" />
                <span className="text-xs font-medium">{event ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg">
                <FaMapMarkerAlt size={11} className="text-[#d4af37]" />
                <span className="text-xs font-medium">{event?.location || 'Venue TBD'}</span>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                isEventDay ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300' : 'bg-white/10 border-white/15 text-white/70'
              }`}>
                {isEventDay ? <FaUnlock size={10} /> : <FaLock size={10} />}
                {isEventDay ? 'Contacts unlocked' : 'Contacts unlock on event day'}
              </div>
            </div>
          </div>
        </div>

        {/* General Matching Summary */}
        {generalMatchesCount > eventMatches.length && (
          <div className="bg-[#4a0e17]/5 border border-[#4a0e17]/10 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4a0e17]/5 rounded-full blur-[40px] translate-x-1/3 -translate-y-1/3" />
            <div className="relative z-10">
              <h3 className="font-black text-[#4a0e17] text-sm uppercase tracking-widest mb-1 flex items-center gap-2">
                <FaUsers className="text-[#d4af37]" /> Broader Network Potential
              </h3>
              <p className="text-sm text-gray-700 font-medium">Our algorithm has identified <strong className="text-[#4a0e17] bg-[#4a0e17]/10 px-2 py-0.5 rounded text-lg">{generalMatchesCount}</strong> total highly-compatible connections across the entire Yenege Unity ecosystem.</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">You will meet your remaining {generalMatchesCount - eventMatches.length} matches at future summits.</p>
            </div>
          </div>
        )}

        {/* Networking Tips - compact grid */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FaLightbulb className="text-[#d4af37]" size={13} />
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quick Tips for Today</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { e: '', t: 'Be specific about what value you can offer.' },
              { e: '', t: 'Exchange contacts right after a good conversation.' },
              { e: '', t: 'Add a quick note below each match while it\'s fresh.' },
              { e: '', t: 'Give before you take — lead with how you can help.' },
            ].map(({ e, t }) => (
              <div key={t} className="flex items-start gap-2 text-xs text-gray-600">
                <span>{e}</span><span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Matches Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaHandshake className="text-[#4a0e17]" size={16} />
            <h2 className="text-lg font-black text-gray-900">Your {eventMatches.length} Matches</h2>
          </div>
        </div>

        {eventMatches.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
            <FaHandshake className="text-gray-200 mx-auto mb-3" size={28} />
            <p className="text-gray-500 font-medium text-sm">Your matches are being processed.</p>
            <p className="text-xs text-gray-400 mt-1">Please check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventMatches.map((match, index) => {
              const profile = match.matchedAttendee;
              if (!profile) return null;
              const isExpanded = expandedMatchId === match.id;

              return (
                <div key={match.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#d4af37]/40 hover:shadow-md transition-all duration-200">
                  {/* Card Top */}
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4a0e17] to-[#791a29] flex items-center justify-center text-white font-black text-lg flex-shrink-0 overflow-hidden">
                        {profile.profilePhoto
                          ? <img src={profile.profilePhoto} alt={profile.fullName} className="w-full h-full object-cover" />
                          : profile.fullName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-gray-900 text-base leading-tight">{profile.fullName}</h3>
                          <span className="text-[9px] font-black text-[#4a0e17] bg-[#4a0e17]/8 px-2 py-0.5 rounded-full flex-shrink-0">#{index + 1}</span>
                        </div>
                        <p className="text-xs text-[#4a0e17] font-semibold mt-0.5">{profile.jobTitle}</p>
                        <p className="text-xs text-gray-400">{profile.companyName}</p>
                      </div>
                    </div>

                    {/* Contact buttons */}
                    <div className="mt-4 flex gap-2">
                      {isEventDay ? (
                        <>
                          <a href={`tel:${profile.phone}`} className="flex-1 bg-gray-50 hover:bg-[#4a0e17] hover:text-white border border-gray-200 hover:border-[#4a0e17] text-gray-700 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors duration-200">
                            <FaPhoneAlt size={10} /> {profile.phone}
                          </a>
                          <a href={`mailto:${profile.email}`} className="flex-1 bg-gray-50 hover:bg-[#4a0e17] hover:text-white border border-gray-200 hover:border-[#4a0e17] text-gray-700 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors duration-200">
                            <FaEnvelope size={10} /> Email
                          </a>
                        </>
                      ) : (
                        <div className="flex-1 bg-gray-50 border border-dashed border-gray-200 py-2.5 rounded-xl flex items-center justify-center gap-2 text-gray-400 text-xs font-medium">
                          <FaLock size={9} /> Contacts available on event day
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <div className="border-t border-gray-50">
                    <button
                      onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                      className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide details' : 'View details & notes'}</span>
                      <FaChevronDown className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} size={10} />
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Industry</p>
                            <p className="text-sm font-semibold text-gray-800">{profile.industry}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Looking for</p>
                            <p className="text-xs text-gray-600 leading-relaxed">{profile.opportunitiesSought || 'General networking'}</p>
                          </div>
                        </div>

                        <textarea
                          value={localNotes[match.id] || ''}
                          onChange={(e) => setLocalNotes({ ...localNotes, [match.id]: e.target.value })}
                          onBlur={() => handleNoteBlur(match.id)}
                          placeholder="Add a private note..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#4a0e17]/20 focus:border-[#4a0e17] resize-none h-16 outline-none placeholder-gray-400"
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => updateMatchStatus(match.id, 'met')}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-colors duration-200 flex items-center justify-center gap-1.5 ${
                              match.status === 'met' || match.status === 'closed'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <FaCheckCircle size={12} /> Met Them
                          </button>
                          <button
                            onClick={() => updateMatchStatus(match.id, 'follow_up')}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-colors duration-200 flex items-center justify-center gap-1.5 ${
                              match.status === 'follow_up'
                                ? 'bg-[#d4af37] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            <FaStar size={12} /> Follow Up
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
