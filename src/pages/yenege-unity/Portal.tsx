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
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 selection:bg-[#4a0e17] selection:text-white font-sans relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-[#d4af37]/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-[#4a0e17]/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />
        
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 sm:p-10 relative shadow-2xl shadow-[#4a0e17]/10 z-10 animate-fade-in">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#d4af37] via-[#ffd447] to-[#d4af37] rounded-t-[2rem]" />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#4a0e17] tracking-tight mb-2">Yenege Unity</h1>
            <p className="text-[#d4af37] font-bold tracking-widest text-xs uppercase">Attendee Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl text-center font-medium animate-shake">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">ኢሜይል (Email)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#4a0e17] focus:border-transparent text-gray-900 outline-none transition-all font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#4a0e17] hover:bg-[#6b1422] text-white font-black rounded-2xl shadow-lg shadow-[#4a0e17]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none text-lg"
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : 'Enter Portal'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <Link to="/yenege-unity" className="text-sm font-bold text-gray-500 hover:text-[#4a0e17] transition-colors">
              ← Back to Main Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-gray-900 font-sans pb-24 selection:bg-[#4a0e17] selection:text-white">
      {/* Mobile-First Sticky Header */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4a0e17] flex items-center justify-center text-white font-black text-xs">
              YU
            </div>
            <span className="text-sm font-black tracking-widest uppercase text-[#4a0e17] hidden sm:block">YENEGE UNITY</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-black text-gray-900">{attendee?.fullName}</p>
              <p className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">{attendee?.companyName}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#4a0e17] hover:bg-gray-100 transition-colors"
              title="Logout"
            >
              <FaSignOutAlt size={14} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 animate-fade-in">
        
        {/* Mobile-Optimized Welcome Banner */}
        <div className="bg-[#4a0e17] rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl shadow-[#4a0e17]/10 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/20 rounded-full blur-[60px] translate-x-1/3 -translate-y-1/3" />
          
          <h1 className="text-2xl sm:text-4xl font-black mb-3 relative z-10 tracking-tight">Welcome to {event?.title || 'Yenege Unity'}, {attendee?.fullName?.split(' ')[0]}!</h1>
          <p className="text-white/80 text-sm sm:text-base max-w-2xl relative z-10 leading-relaxed font-medium">
            Based on your profile, we have handpicked <span className="text-[#d4af37] font-black text-lg">{eventMatches.length}</span> key individuals for you to connect with today at this event. Make the most of these opportunities.
          </p>

          <div className="flex flex-wrap gap-3 mt-6 relative z-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl">
              <FaCalendarAlt className="text-[#d4af37]" size={14} />
              <span className="text-xs font-bold tracking-wide">{event ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Event date TBD"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl">
              <FaMapMarkerAlt className="text-[#d4af37]" size={14} />
              <span className="text-xs font-bold tracking-wide">{event ? event.location : 'Venue TBD'}</span>
            </div>
            {/* Contact Lock Status Badge */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${isEventDay ? 'bg-emerald-500/20 border-emerald-400/30' : 'bg-white/10 border-white/20'}`}>
              {isEventDay ? <FaUnlock className="text-emerald-400" size={12} /> : <FaLock className="text-[#d4af37]" size={12} />}
              <span className="text-xs font-bold">
                {isEventDay ? 'Contacts Unlocked!' : `Contacts unlock on ${event ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'event day'}`}
              </span>
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

        {/* Networking Tips Banner */}
        <div className="bg-white border border-[#d4af37]/20 rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#fdfbf7] border border-[#d4af37]/30 flex items-center justify-center flex-shrink-0">
            <FaLightbulb className="text-[#d4af37]" size={16} />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 mb-2">Networking Tips for Today</p>
            <ul className="space-y-1.5 text-xs text-gray-600 font-medium">
              <li>🎯 <strong>Be specific:</strong> Instead of "let's connect," say what exact value you can offer each match.</li>
              <li>📸 <strong>Exchange contacts immediately</strong> after a meaningful conversation — memory fades fast in busy events.</li>
              <li>✍️ <strong>Take a quick note</strong> below each match after you meet them so you remember the context later.</li>
              <li>🔄 <strong>Follow up within 24 hours</strong> — mark "Follow Up" on anyone you want to reconnect with.</li>
              <li>🤝 <strong>Give before you take</strong> — open with how you can help them, not what you need.</li>
            </ul>
          </div>
        </div>

        {/* Matches Section Header */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-3 text-gray-900 tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <FaHandshake className="text-orange-500" size={18} />
            </div>
            Your {eventMatches.length} Strategic Matches
          </h2>
        </div>

        {eventMatches.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHandshake className="text-gray-300" size={24} />
            </div>
            <p className="text-gray-500 font-medium">Your matches are currently being processed.</p>
            <p className="text-sm text-gray-400 mt-1">Please check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {eventMatches.map((match, index) => {
              const profile = match.matchedAttendee;
              if (!profile) return null;
              
              const isExpanded = expandedMatchId === match.id;

              return (
                <div key={match.id} className="bg-white border border-gray-100 rounded-[2rem] p-1 flex flex-col hover:border-[#d4af37]/30 transition-all shadow-sm hover:shadow-xl group relative overflow-hidden">
                  
                  {/* Inner Content Wrapper */}
                  <div className="p-5 sm:p-6">
                    {/* Header: Photo & Badge */}
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4a0e17] to-[#791a29] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#4a0e17]/20 overflow-hidden">
                        {profile.profilePhoto ? (
                          <img src={profile.profilePhoto} alt={profile.fullName} className="w-full h-full object-cover" />
                        ) : (
                          profile.fullName.charAt(0)
                        )}
                      </div>
                      <div className="bg-[#fdfbf7] border border-[#d4af37]/30 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-[#4a0e17] font-black shadow-sm">
                        Match {index + 1}
                      </div>
                    </div>

                    {/* Primary Info */}
                    <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight">{profile.fullName}</h3>
                    <p className="text-[#4a0e17] font-bold text-sm flex items-center gap-2 mt-2">
                      <FaUserTie size={12} className="opacity-70" /> {profile.jobTitle}
                    </p>
                    <p className="text-gray-500 text-sm flex items-center gap-2 mt-1.5 font-medium">
                      <FaBuilding size={12} className="opacity-70" /> {profile.companyName}
                    </p>

                    {/* Quick Contact Action — locked until event day */}
                    <div className="mt-5 flex gap-2">
                      {isEventDay ? (
                        <>
                          <a href={`tel:${profile.phone}`} className="flex-1 bg-[#4a0e17]/5 hover:bg-[#4a0e17]/10 text-[#4a0e17] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-[#4a0e17]/10">
                            <FaPhoneAlt size={10} /> {profile.phone}
                          </a>
                          <a href={`mailto:${profile.email}`} className="flex-1 bg-[#4a0e17]/5 hover:bg-[#4a0e17]/10 text-[#4a0e17] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-[#4a0e17]/10">
                            <FaEnvelope size={10} /> Email
                          </a>
                        </>
                      ) : (
                        <div className="flex-1 bg-gray-50 border border-dashed border-gray-200 py-3 rounded-xl flex items-center justify-center gap-2 text-gray-400 text-xs font-bold">
                          <FaLock size={10} /> Contacts unlock on event day ({event?.date ?? '...'})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expandable Section for Mobile */}
                  <div className="px-1 pb-1 mt-auto">
                    <button 
                      onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors md:hidden"
                    >
                      {isExpanded ? 'Show Less' : 'View Networking Details'}
                      <FaChevronDown className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 md:max-h-[500px] md:opacity-100'}`}>
                      <div className="p-4 sm:p-5 bg-gray-50 rounded-[1.5rem] space-y-4">
                        
                        {/* Why Match */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Industry</p>
                            <p className="text-sm font-bold text-gray-800">{profile.industry}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">What They Need</p>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">{profile.opportunitiesSought || 'Exploring general partnerships and networking opportunities.'}</p>
                          </div>
                        </div>

                        {/* Interactive Networking Controls */}
                        <div className="pt-4 border-t border-gray-200 space-y-3">
                          <textarea
                            value={localNotes[match.id] || ''}
                            onChange={(e) => setLocalNotes({ ...localNotes, [match.id]: e.target.value })}
                            onBlur={() => handleNoteBlur(match.id)}
                            placeholder="Add a private note about this person..."
                            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#4a0e17] focus:border-transparent resize-none h-20 transition-all placeholder:text-gray-400"
                          />

                          {/* Large, Tappable Status Buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => updateMatchStatus(match.id, 'met')}
                              className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                                match.status === 'met' || match.status === 'closed'
                                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-[1.02]'
                                  : 'bg-white text-gray-500 border border-gray-200 hover:border-emerald-500/50 hover:text-emerald-500'
                              }`}
                            >
                              <FaCheckCircle size={14} /> Met Them
                            </button>
                            <button
                              onClick={() => updateMatchStatus(match.id, 'follow_up')}
                              className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                                match.status === 'follow_up'
                                  ? 'bg-[#d4af37] text-white shadow-md shadow-[#d4af37]/20 scale-[1.02]'
                                  : 'bg-white text-gray-500 border border-gray-200 hover:border-[#d4af37]/50 hover:text-[#d4af37]'
                              }`}
                            >
                              <FaStar size={14} /> Follow Up
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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
