import { useEffect, useState } from 'react';
import { 
  FaUsers, FaCheckCircle, FaHourglassHalf, FaCrown, FaHandshake, 
  FaUser, FaSearch, FaQrcode, FaChartPie, FaPlus, FaExclamationTriangle,
  FaSpinner, FaBullseye, FaLink
} from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { yenegeUnityApi } from '../../services/yenegeUnityApi';
import { YenegeUnityAttendee, YenegeUnityEvent, YenegeUnityGroup } from '../../types/yenegeUnity';

export default function YenegeUnityDashboard() {
  const [attendees, setAttendees] = useState<YenegeUnityAttendee[]>([]);
  const [events, setEvents] = useState<YenegeUnityEvent[]>([]);
  const [groups, setGroups] = useState<YenegeUnityGroup[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'crm' | 'matchmaker' | 'events' | 'checkin' | 'analytics'>('crm');
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [filterTargetSector] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');

  // Selected attendee for CRM modal
  const [selectedAttendee, setSelectedAttendee] = useState<YenegeUnityAttendee | null>(null);
  const [newTag, setNewTag] = useState('');
  const [commType, setCommType] = useState<'call' | 'email' | 'whatsapp' | 'note'>('call');
  const [commNote, setCommNote] = useState('');

  // Event planner states
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventCapacity, setNewEventCapacity] = useState(120);

  // Group creation state
  const [newGroupName, setNewGroupName] = useState('');

  const getDuplicatesFor = (att: YenegeUnityAttendee) => {
    return attendees.filter(other => 
      other.id !== att.id && 
      (
        (other.email && other.email.trim().toLowerCase() === att.email.trim().toLowerCase()) ||
        (other.phone && other.phone.trim() === att.phone.trim())
      )
    );
  };
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // Matchmaking link state
  // Tracks canonical pair keys (sortedIdA|sortedIdB) that have been persisted
  const [linkedPairs, setLinkedPairs] = useState<Set<string>>(new Set());
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);

  // Check-in input
  const [checkInCode, setCheckInCode] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const attsData = await yenegeUnityApi.getAttendees();
      const evsData = await yenegeUnityApi.getEvents();
      const grpsData = await yenegeUnityApi.getGroups();
      setAttendees(attsData);
      setEvents(evsData);
      setGroups(grpsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations
  const totalCount = attendees.length;
  const approvedCount = attendees.filter(a => a.status === 'accepted').length;
  const pendingCount = attendees.filter(a => a.status === 'pending').length;
  const vipCount = attendees.filter(a => a.vipCandidate || a.interestLevel === 'vip').length;
  const sponsorProspects = attendees.filter(a => a.sponsorshipInterest || a.tags.includes('Sponsor')).length;
  const checkedInCount = attendees.filter(a => a.checkedIn).length;

  // Filter attendees
  const filteredAttendees = attendees.filter(a => {
    const matchesSearch = 
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchesIndustry = filterIndustry === 'all' || a.industry === filterIndustry;
    const matchesTargetSector = filterTargetSector === 'all' || a.targetNetworkingSectors.includes(filterTargetSector);
    const matchesTag = filterTag === 'all' || a.tags.includes(filterTag);

    return matchesSearch && matchesStatus && matchesIndustry && matchesTargetSector && matchesTag;
  });

  // Action Handlers
  const handleUpdateStatus = async (id: string, status: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    try {
      const updated = await yenegeUnityApi.updateAttendee(id, { status });
      setAttendees(prev => prev.map(a => a.id === id ? updated : a));
      if (selectedAttendee?.id === id) setSelectedAttendee(updated);
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleUpdateCRMField = async (
    id: string, 
    field: 'calledStatus' | 'interestLevel' | 'paymentStatus' | 'followUpNeeded' | 'confirmedAttendance' | 'vipCandidate' | 'internalNotes' | 'welcomeEmailSent',
    value: any
  ) => {
    try {
      const updated = await yenegeUnityApi.updateAttendee(id, { [field]: value });
      setAttendees(prev => prev.map(a => a.id === id ? updated : a));
      if (selectedAttendee?.id === id) setSelectedAttendee(updated);
    } catch (err) {
      alert('Error updating CRM field');
    }
  };

  const handleAddTag = async (id: string) => {
    if (!newTag.trim()) return;
    const currentAttendee = attendees.find(a => a.id === id);
    if (!currentAttendee) return;
    if (currentAttendee.tags.includes(newTag.trim())) return;
    
    const updatedTags = [...currentAttendee.tags, newTag.trim()];
    try {
      const updated = await yenegeUnityApi.updateAttendee(id, { tags: updatedTags });
      setAttendees(prev => prev.map(a => a.id === id ? updated : a));
      if (selectedAttendee?.id === id) setSelectedAttendee(updated);
      setNewTag('');
    } catch (err) {
      alert('Error adding tag');
    }
  };

  const handleRemoveTag = async (id: string, tagToRemove: string) => {
    const currentAttendee = attendees.find(a => a.id === id);
    if (!currentAttendee) return;
    
    const updatedTags = currentAttendee.tags.filter(t => t !== tagToRemove);
    try {
      const updated = await yenegeUnityApi.updateAttendee(id, { tags: updatedTags });
      setAttendees(prev => prev.map(a => a.id === id ? updated : a));
      if (selectedAttendee?.id === id) setSelectedAttendee(updated);
    } catch (err) {
      alert('Error removing tag');
    }
  };

  const handleAddCommLog = async (id: string) => {
    if (!commNote.trim()) return;
    try {
      const updated = await yenegeUnityApi.addCommLog(id, {
        userId: 'admin',
        userName: 'Admin Coordinator',
        type: commType,
        note: commNote
      });
      setAttendees(prev => prev.map(a => a.id === id ? updated : a));
      if (selectedAttendee?.id === id) setSelectedAttendee(updated);
      setCommNote('');
    } catch (err) {
      alert('Error logging communication');
    }
  };

  const handleCheckInAttendee = async (id: string) => {
    try {
      const updated = await yenegeUnityApi.updateAttendee(id, { 
        checkedIn: true, 
        checkedInAt: new Date().toISOString() 
      });
      setAttendees(prev => prev.map(a => a.id === id ? updated : a));
      if (selectedAttendee?.id === id) setSelectedAttendee(updated);
      alert(`${updated.fullName} has been successfully checked in!`);
    } catch (err) {
      alert('Check-in failed');
    }
  };

  const handleToggleBadgePrinted = async (id: string) => {
    const att = attendees.find(a => a.id === id);
    if (!att) return;
    try {
      const updated = await yenegeUnityApi.updateAttendee(id, { badgePrinted: !att.badgePrinted });
      setAttendees(prev => prev.map(a => a.id === id ? updated : a));
      if (selectedAttendee?.id === id) setSelectedAttendee(updated);
    } catch (err) {
      alert('Error updating badge print status');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;
    try {
      const newEv = await yenegeUnityApi.createEvent({
        title: newEventTitle,
        description: 'New premium session planners',
        date: newEventDate,
        time: '14:00 - 20:00',
        location: 'Skylight Hotel, Addis Ababa',
        capacity: newEventCapacity,
        sessions: [],
        sponsors: [],
        attendeeIds: []
      });
      setEvents(prev => [...prev, newEv]);
      setNewEventTitle('');
      setNewEventDate('');
      alert('Summit event planned successfully!');
    } catch (err) {
      alert('Error creating event');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;
    try {
      const newGrp = await yenegeUnityApi.createGroup({
        name: newGroupName,
        description: newGroupDesc,
        attendeeIds: [],
        type: 'circle'
      });
      setGroups(prev => [...prev, newGrp]);
      setNewGroupName('');
      setNewGroupDesc('');
      alert('Networking circle created!');
    } catch (err) {
      alert('Error creating circle');
    }
  };

  const handleAddAttendeeToGroup = async (groupId: string, attendeeId: string) => {
    const grp = groups.find(g => g.id === groupId);
    if (!grp) return;
    if (grp.attendeeIds.includes(attendeeId)) return;
    
    const updatedIds = [...grp.attendeeIds, attendeeId];
    try {
      const updated = await yenegeUnityApi.updateGroup(groupId, { attendeeIds: updatedIds });
      setGroups(prev => prev.map(g => g.id === groupId ? updated : g));
    } catch (err) {
      alert('Error updating circle placement');
    }
  };

  const handleRemoveAttendeeFromGroup = async (groupId: string, attendeeId: string) => {
    const grp = groups.find(g => g.id === groupId);
    if (!grp) return;
    
    const updatedIds = grp.attendeeIds.filter(id => id !== attendeeId);
    try {
      const updated = await yenegeUnityApi.updateGroup(groupId, { attendeeIds: updatedIds });
      setGroups(prev => prev.map(g => g.id === groupId ? updated : g));
    } catch (err) {
      alert('Error updating circle placement');
    }
  };

  const handleSimulateCheckInByCode = () => {
    const match = attendees.find(a => a.qrCode === checkInCode || a.email.toLowerCase() === checkInCode.toLowerCase());
    if (match) {
      handleCheckInAttendee(match.id);
      setCheckInCode('');
    } else {
      alert('No matching attendee found for this ticket code.');
    }
  };

  // ── MATCH LINKAGE ──────────────────────────────────────────

  /** Save a single bidirectional match pair to the DB */
  const handleLinkMatch = async (attId: string, otherId: string) => {
    const pairKey = [attId, otherId].sort().join('|');
    try {
      await yenegeUnityApi.createMatch(attId, otherId);
      setLinkedPairs(prev => {
        const next = new Set<string>();
        prev.forEach(v => next.add(v));
        next.add(pairKey);
        return next;
      });
    } catch (err) {
      alert('Failed to link match. Please try again.');
    }
  };

  /** Run the full algorithm and bulk-save all new pairs */
  const handleGenerateAllMatches = async () => {
    const accepted = attendees.filter(a => a.status === 'accepted');
    if (accepted.length === 0) {
      alert('No accepted attendees to match yet.');
      return;
    }
    setIsGeneratingMatches(true);
    try {
      const newPairs = await yenegeUnityApi.generateAllMatches(accepted);
      // Rebuild linked pairs set from all accepted attendees so buttons update
      const allPairKeys = new Set<string>();
      accepted.forEach(att => {
        accepted.forEach(other => {
          if (att.id === other.id) return;
          const targetMatches = att.targetNetworkingSectors.includes(other.industry);
          const otherTargetMatches = other.targetNetworkingSectors.includes(att.industry);
          if (targetMatches || otherTargetMatches) {
            allPairKeys.add([att.id, other.id].sort().join('|'));
          }
        });
      });
      setLinkedPairs(allPairKeys);
      alert(`✅ Done! ${newPairs} new match pair${newPairs !== 1 ? 's' : ''} linked to attendee portals.`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsGeneratingMatches(false);
    }
  };

  // Get cross-industry target matches for an attendee
  const getMatchSuggestions = (att: YenegeUnityAttendee) => {
    return attendees.filter(other => {
      if (other.id === att.id) return false;
      // Does 'other' belong to one of 'att's target networking sectors?
      const targetMatches = att.targetNetworkingSectors.includes(other.industry);
      // Does 'att' belong to one of 'other's target networking sectors?
      const otherTargetMatches = other.targetNetworkingSectors.includes(att.industry);
      return targetMatches || otherTargetMatches;
    });
  };

  // Tag list for filter selector
  const availableTags = [
    'VIP', 'Investor', 'Startup Founder', 'Sponsor', 'Creative', 
    'Recruiter', 'Business Owner', 'Media', 'Influencer', 'Potential Partner'
  ];

  // Industry sectors list
  const industries = [
    'Technology', 'Finance', 'Manufacturing', 'Construction', 'Real Estate', 
    'Media', 'Marketing', 'Hospitality', 'Fashion', 'Agriculture', 'Healthcare', 
    'Education', 'NGO', 'Government', 'Event Industry', 'Creative Arts', 
    'Logistics', 'E-commerce', 'Consulting', 'Telecommunications', 'Energy', 
    'Tourism', 'Food & Beverage'
  ];

  if (loading) {
    return (
      <AdminLayout title="Yenege Unity Control Center">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-[#4a0e17]/10" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#4a0e17] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full bg-[#4a0e17]/5 flex items-center justify-center">
                <FaUsers className="text-[#4a0e17]" size={16} />
              </div>
            </div>
            <div>
              <p className="text-gray-900 font-bold text-sm">Loading CRM Data</p>
              <p className="text-gray-400 text-xs mt-0.5">Fetching attendees &amp; events...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Yenege Unity Control Center">

      {/* ── Tab Navigation ── */}
      <div className="mb-6">
        <div className="flex items-center gap-1 bg-gray-100/70 p-1 rounded-2xl w-fit flex-wrap">
          {([
            { key: 'crm',        label: 'CRM & Intake',        emoji: '👤' },
            { key: 'matchmaker', label: 'Matchmaking',          emoji: '🤝' },
            { key: 'events',     label: 'Events',               emoji: '📅' },
            { key: 'checkin',    label: 'Check-In & Badges',    emoji: '🎟️' },
            { key: 'analytics',  label: 'Analytics',            emoji: '📊' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white text-[#4a0e17] shadow-sm ring-1 ring-black/5 font-bold'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
              }`}
            >
              <span>{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total',       value: totalCount,        icon: FaUsers,        bg: 'bg-blue-500',    light: 'bg-blue-50',    text: 'text-blue-600'   },
          { label: 'Approved',    value: approvedCount,     icon: FaCheckCircle,  bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600'},
          { label: 'Pending',     value: pendingCount,      icon: FaHourglassHalf,bg: 'bg-amber-400',   light: 'bg-amber-50',   text: 'text-amber-600'  },
          { label: 'VIP',         value: vipCount,          icon: FaCrown,        bg: 'bg-purple-500',  light: 'bg-purple-50',  text: 'text-purple-600' },
          { label: 'Sponsors',    value: sponsorProspects,  icon: FaHandshake,    bg: 'bg-rose-500',    light: 'bg-rose-50',    text: 'text-rose-600'   },
          { label: 'Checked In',  value: `${checkedInCount}/${approvedCount}`, icon: FaCheckCircle, bg: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-600' },
        ].map(({ label, value, icon: Icon, light, text }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow duration-200">
            <div className={`w-10 h-10 rounded-xl ${light} ${text} flex items-center justify-center flex-shrink-0`}>
              <Icon size={17} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide truncate">{label}</p>
              <p className={`text-xl font-black ${text}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ────────────────── TAB 1: EXECUTIVE CRM & INTAKE ────────────────── */}
      {activeTab === 'crm' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#4a0e17]/30 focus-within:ring-2 focus-within:ring-[#4a0e17]/10 transition-all">
                <FaSearch className="text-gray-400 mr-2 flex-shrink-0" size={13} />
                <input
                  type="text"
                  placeholder="Search by name, company, title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:outline-none w-full text-sm text-gray-700 placeholder-gray-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 ml-1 flex-shrink-0 text-sm">✕</button>
                )}
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none cursor-pointer md:w-40">
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none cursor-pointer md:w-44">
                <option value="all">All Industries</option>
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
              <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none cursor-pointer md:w-36">
                <option value="all">All Tags</option>
                {availableTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>
            {filteredAttendees.length !== attendees.length && (
              <p className="text-xs text-gray-400 mt-2">Showing <span className="font-bold text-[#4a0e17]">{filteredAttendees.length}</span> of {attendees.length}</p>
            )}
          </div>

          {/* Attendee Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Person</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Industry</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Targets</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Tags</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAttendees.map(att => (
                    <tr key={att.id} className="hover:bg-gray-50/60 transition-colors duration-100">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-200">
                            {att.profilePhoto ? (
                              <img src={att.profilePhoto} alt={att.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <FaUser className="text-gray-400" size={13} />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm leading-tight flex items-center gap-1.5">
                              {att.fullName}
                              {getDuplicatesFor(att).length > 0 && (
                                <span className="px-1 py-0.5 bg-red-50 text-red-500 border border-red-100 rounded text-[9px] font-bold animate-pulse">DUP</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400 leading-tight">{att.jobTitle} · {att.companyName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">{att.industry}</span>
                        {att.participantType && <span className="ml-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold">{att.participantType}</span>}
                        <p className="text-[10px] text-gray-400 mt-1">{att.yearsOfExperience}yr · {att.companySize} staff</p>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {att.targetNetworkingSectors.slice(0, 2).map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-semibold">{s}</span>
                          ))}
                          {att.targetNetworkingSectors.length > 2 && (
                            <span className="text-[9px] text-gray-400">+{att.targetNetworkingSectors.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            att.status === 'accepted' ? 'bg-emerald-500' :
                            att.status === 'rejected' ? 'bg-red-400' : 'bg-amber-400'
                          }`} />
                          <span className={`text-xs font-semibold capitalize ${
                            att.status === 'accepted' ? 'text-emerald-700' :
                            att.status === 'rejected' ? 'text-red-600' : 'text-amber-700'
                          }`}>{att.status}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{att.calledStatus.replace(/_/g, ' ')}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {att.tags.slice(0, 2).map(t => (
                            <span key={t} className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100/80 rounded text-[9px] font-semibold">{t}</span>
                          ))}
                          {att.tags.length > 2 && <span className="text-[9px] text-gray-400">+{att.tags.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedAttendee(att)}
                          className="px-3 py-1.5 bg-[#4a0e17] text-white rounded-lg text-xs font-semibold hover:bg-[#6b1422] transition-colors duration-200 shadow-sm"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredAttendees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-14">
                        <FaUsers className="text-gray-200 mx-auto mb-2" size={28} />
                        <p className="text-gray-400 text-sm font-medium">No applicants match your filters</p>
                        <button onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterIndustry('all'); setFilterTag('all'); }} className="text-xs text-[#4a0e17] font-semibold mt-1 hover:underline">Clear filters</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── TAB 2: MATCHMAKING INTELLIGENCE ────────────────── */}
      {activeTab === 'matchmaker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Circle Creator / Seating Desk */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaCrown className="text-amber-500" /> Create Seating Table / Circle
              </h3>
              <form onSubmit={handleCreateGroup} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Circle Name</label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                    placeholder="e.g. Technology & VCs Rotunda"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                    placeholder="Brief description of matchmaking strategy..."
                    rows={2}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#4a0e17] text-white font-bold rounded-xl text-sm hover:bg-[#6b1422] transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-[#4a0e17]/20 flex items-center justify-center gap-2"
                >
                  <FaPlus size={12} /> Plan Circle
                </button>
              </form>
            </div>

            {/* Current Circles */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Current planned circles</h3>
              <div className="space-y-3">
                {groups.map(g => (
                  <div key={g.id} className="p-4 bg-gray-50 rounded-xl border border-gray-150 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-gray-900">{g.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full capitalize">{g.type}</span>
                    </div>
                    <p className="text-xs text-gray-500">{g.description}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Seats Allocated: {g.attendeeIds.length}</p>
                    
                    {/* Circle placements */}
                    <div className="space-y-1 pt-2 border-t border-gray-200">
                      {g.attendeeIds.map(attId => {
                        const att = attendees.find(a => a.id === attId);
                        if (!att) return null;
                        return (
                          <div key={attId} className="flex justify-between items-center bg-white p-1 px-2 rounded border border-gray-100 text-[10px] font-semibold">
                            <span className="truncate">{att.fullName} ({att.companyName})</span>
                            <button
                              onClick={() => handleRemoveAttendeeFromGroup(g.id, attId)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Matchmaking Grid */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Cross-Industry Synergy Generator</h3>
                <p className="text-xs text-gray-500 mt-1">Matches are saved bidirectionally — both attendees will see each other in their portal.</p>
              </div>
              {/* ── BULK GENERATE BUTTON ── */}
              <button
                onClick={handleGenerateAllMatches}
                disabled={isGeneratingMatches}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#4a0e17] text-white text-xs font-black rounded-xl hover:bg-[#6b1422] transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-[#4a0e17]/20 disabled:opacity-60 disabled:pointer-events-none"
              >
                {isGeneratingMatches ? <FaSpinner className="animate-spin" /> : <FaLink />}
                {isGeneratingMatches ? 'Generating…' : 'Generate All Matches'}
              </button>
            </div>

            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
              {attendees.filter(a => a.status === 'accepted').map(att => {
                const suggestions = getMatchSuggestions(att);
                return (
                  <div key={att.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{att.fullName}</h4>
                        <p className="text-xs text-gray-500">{att.jobTitle} @ {att.companyName} | Industry: <span className="text-blue-600 font-semibold">{att.industry}</span> {att.participantType && <span className="text-amber-600 font-semibold ml-1">[{att.participantType}]</span>}</p>
                        <p className="text-[10px] text-amber-600 font-bold mt-1">🎯 Targets: {att.targetNetworkingSectors.join(', ')}</p>
                      </div>
                      
                      {/* Circle quick assignment */}
                      <div>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddAttendeeToGroup(e.target.value, att.id);
                              e.target.value = '';
                            }
                          }}
                          className="px-2 py-1 bg-white border border-gray-300 rounded text-[10px] font-bold text-gray-600 focus:outline-none"
                        >
                          <option value="">Assign to Circle...</option>
                          {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Suggestions list */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Suggested matches ({suggestions.length})</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {suggestions.map(other => {
                          const pairKey = [att.id, other.id].sort().join('|');
                          const isLinked = linkedPairs.has(pairKey);
                          return (
                            <div key={other.id} className={`p-2.5 bg-white rounded-xl border flex items-center justify-between text-xs transition ${isLinked ? 'border-emerald-300 bg-emerald-50' : 'border-gray-150 hover:border-[#4a0e17]/30'}`}>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-gray-900 truncate">{other.fullName}</p>
                                <p className="text-[10px] text-gray-500 truncate">{other.companyName} | {other.industry}</p>
                                <p className="text-[9px] text-gray-400 font-medium truncate">Offers: {other.valueOffer}</p>
                              </div>
                              <div className="ml-2 flex-shrink-0">
                                {isLinked ? (
                                  <span className="flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded">
                                    <FaCheckCircle size={8}/> Linked
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleLinkMatch(att.id, other.id)}
                                    className="flex items-center gap-1 text-[9px] font-extrabold px-2 py-1 bg-[#4a0e17] text-white rounded hover:bg-[#6b1422] transition-all hover:-translate-y-0.5"
                                  >
                                    <FaLink size={8}/> Link
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {suggestions.length === 0 && (
                          <p className="text-xs text-gray-400 italic">No direct targets registered yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── TAB 3: EVENTS & SESSIONS PLANNER ────────────────── */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Plan New Summit Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none"
                  placeholder="e.g. Yenege Unity Executive Dinner"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Venue Capacity Capping</label>
                <input
                  type="number"
                  value={newEventCapacity}
                  onChange={(e) => setNewEventCapacity(parseInt(e.target.value) || 120)}
                  min="1"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none text-gray-600"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#4a0e17] text-white font-bold rounded-xl text-sm hover:bg-[#6b1422] transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-[#4a0e17]/20"
              >
                Plan Summit Module
              </button>
            </form>

            {/* Paid attendees quick-stat */}
            <div className="bg-[#fdfbf7] border border-[#d4af37]/20 rounded-xl p-4 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#4a0e17]">Eligible to Assign</p>
              <p className="text-2xl font-black text-gray-900">{attendees.filter(a => a.paymentStatus === 'paid' || a.paymentStatus === 'waived').length}</p>
              <p className="text-[10px] text-gray-400 font-medium">Attendees with paid / waived status</p>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Planned Events</h3>
            <div className="space-y-6">
              {events.length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-8">No events planned yet. Create one on the left.</p>
              )}
              {events.map(ev => {
                const assignedCount = ev.attendeeIds?.length ?? 0;
                const capacityPct = Math.min(100, Math.round((assignedCount / ev.capacity) * 100));
                // Paid + waived attendees not yet in this event
                const eligible = attendees.filter(
                  a => (a.paymentStatus === 'paid' || a.paymentStatus === 'waived') && !(ev.attendeeIds ?? []).includes(a.id)
                );
                
                return (
                  <div key={ev.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-5">
                    {/* Event Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-base text-gray-900">{ev.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{ev.location} | <span className="font-bold text-[#4a0e17]">{ev.date}</span> at {ev.time}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">Planned</span>
                    </div>

                    {/* Capacity Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500 font-semibold">
                        <span>Assigned: {assignedCount} / {ev.capacity}</span>
                        <span>{capacityPct}% capacity</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${capacityPct >= 100 ? 'bg-red-500' : 'bg-[#4a0e17]'}`}
                          style={{ width: `${capacityPct}%` }}
                        />
                      </div>
                      {assignedCount >= ev.capacity && (
                        <p className="text-[10px] text-red-500 flex items-center gap-1 font-bold mt-1">
                          <FaExclamationTriangle /> Warning: Venue capacity reached!
                        </p>
                      )}
                    </div>

                    {/* ── ASSIGN PAID ATTENDEES ── */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assign Paid Attendees</p>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          🔗 Auto-matches on add
                        </span>
                      </div>

                      {/* Dropdown picker */}
                      {eligible.length > 0 && assignedCount < ev.capacity ? (
                        <select
                          defaultValue=""
                          onChange={async (e) => {
                            if (!e.target.value) return;
                            const attId = e.target.value;
                            e.target.value = '';
                            try {
                              const updated = await yenegeUnityApi.addAttendeeToEvent(ev.id, attId, attendees);
                              setEvents(prev => prev.map(x => x.id === ev.id ? updated : x));
                              // Also mark all algorithm-generated pairs as linked in UI
                              const eventAtts = attendees.filter(a => updated.attendeeIds.includes(a.id));
                              const newPairs = new Set<string>();
                              linkedPairs.forEach(p => newPairs.add(p));
                              eventAtts.forEach(a => eventAtts.forEach(b => {
                                if (a.id !== b.id) newPairs.add([a.id, b.id].sort().join('|'));
                              }));
                              setLinkedPairs(newPairs);
                            } catch (err: any) {
                              alert(`Error: ${err.message}`);
                            }
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:ring-2 focus:ring-[#4a0e17] outline-none"
                        >
                          <option value="">＋ Add attendee to this event...</option>
                          {eligible.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.fullName} — {a.companyName} ({a.paymentStatus})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          {assignedCount >= ev.capacity ? 'Capacity reached.' : 'All paid attendees are assigned.'}
                        </p>
                      )}

                      {/* Assigned list */}
                      {(ev.attendeeIds ?? []).length > 0 && (
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                          {(ev.attendeeIds ?? []).map(attId => {
                            const att = attendees.find(a => a.id === attId);
                            if (!att) return null;
                            return (
                              <div key={attId} className="flex items-center justify-between bg-white p-2.5 px-3 rounded-xl border border-gray-100 text-xs">
                                <div>
                                  <span className="font-bold text-gray-900">{att.fullName}</span>
                                  <span className="text-gray-400 ml-1.5">· {att.companyName} · {att.industry} {att.participantType && `· ${att.participantType}`}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${att.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {att.paymentStatus}
                                  </span>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const updated = await yenegeUnityApi.removeAttendeeFromEvent(ev.id, attId);
                                        setEvents(prev => prev.map(x => x.id === ev.id ? updated : x));
                                      } catch (err: any) {
                                        alert(`Error: ${err.message}`);
                                      }
                                    }}
                                    className="text-red-400 hover:text-red-600 transition-colors"
                                    title="Remove from event"
                                  >✕</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Sessions List */}
                    {ev.sessions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sessions ({ev.sessions.length})</p>
                        <div className="space-y-2">
                          {ev.sessions.map(s => (
                            <div key={s.id} className="p-3 bg-white rounded-xl border border-gray-150 text-xs">
                              <div className="flex justify-between font-bold text-gray-900">
                                <span>{s.title}</span>
                                <span className="text-amber-600">{s.time}</span>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-0.5">Speaker: {s.speaker} | {s.location}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}


      {/* ────────────────── TAB 4: CHECK-IN DESK & BADGES ────────────────── */}
      {activeTab === 'checkin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Check-In Control */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaQrcode className="text-amber-500" /> Live Check-In Scanner
              </h3>
              <p className="text-xs text-gray-500 mt-1">Scan or input the ticket QR code / attendee email to verify invitation status.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ticket Reference / Email</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={checkInCode}
                    onChange={(e) => setCheckInCode(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none"
                    placeholder="e.g. unity-ticket-michael-chen-apex"
                  />
                  <button
                    onClick={handleSimulateCheckInByCode}
                    className="px-4 py-2 bg-[#4a0e17] text-white font-bold rounded-xl text-sm hover:bg-[#6b1422] transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-[#4a0e17]/20"
                  >
                    Verify
                  </button>
                </div>
              </div>

              {/* Status display */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vetted Attendees List ({approvedCount})</p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {attendees.filter(a => a.status === 'accepted').map(att => (
                    <div key={att.id} className="p-3 bg-gray-50 rounded-xl border border-gray-150 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-gray-900">{att.fullName}</p>
                        <p className="text-[10px] text-gray-500">{att.companyName} | {att.industry}</p>
                      </div>
                      
                      {att.checkedIn ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold">Checked In</span>
                      ) : (
                        <button
                          onClick={() => handleCheckInAttendee(att.id)}
                          className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-lg text-[10px] font-bold"
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Badge Preview Desk */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Executive Badge Printing Desk</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {attendees.filter(a => a.status === 'accepted').map(att => (
                <div key={att.id} className="p-4 bg-neutral-900 text-white rounded-3xl border border-amber-500/20 flex flex-col justify-between min-h-[220px] shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-600" />
                  
                  {/* Badge top */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none">YENEGE UNITY</span>
                      <p className="text-[7px] text-gray-400 uppercase tracking-widest leading-none mt-0.5">Summit 2026</p>
                    </div>
                    {att.tags.includes('VIP') && (
                      <span className="px-1.5 py-0.5 bg-amber-500 text-black text-[8px] font-black rounded uppercase">VIP</span>
                    )}
                  </div>

                  {/* Badge middle */}
                  <div className="my-3 space-y-1 text-center">
                    <p className="text-lg font-black tracking-tight">{att.fullName}</p>
                    <p className="text-[10px] text-amber-400 font-bold leading-none">{att.jobTitle}</p>
                    <p className="text-[9px] text-gray-400 leading-none">{att.companyName}</p>
                  </div>

                  {/* Badge bottom */}
                  <div className="border-t border-white/5 pt-2 flex justify-between items-center text-[8px] text-gray-500 font-bold uppercase tracking-wider">
                    <div>
                      <p>Vertical: <span className="text-white">{att.industry}</span></p>
                      <p>Targets: <span className="text-white">{att.targetNetworkingSectors.slice(0,2).join(', ')}</span></p>
                    </div>
                    <button
                      onClick={() => handleToggleBadgePrinted(att.id)}
                      className={`px-2 py-1 rounded text-[7px] font-black uppercase tracking-wider ${
                        att.badgePrinted 
                          ? 'bg-green-600 text-white' 
                          : 'bg-white text-black hover:bg-amber-400 transition'
                      }`}
                    >
                      {att.badgePrinted ? '✓ Printed' : 'Print Badge'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── TAB 5: VISUAL ANALYTICS ────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sector Demands */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaChartPie className="text-amber-500" /> Current Industries representation
              </h3>
              <div className="space-y-3">
                {industries.map(ind => {
                  const count = attendees.filter(a => a.industry === ind).length;
                  if (count === 0) return null;
                  const pct = Math.round((count / totalCount) * 100);
                  return (
                    <div key={ind} className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600 font-bold">
                        <span>{ind}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Target Sectors demands */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaBullseye className="text-amber-500" /> Target Sectors Demand (Most Requested)
              </h3>
              <div className="space-y-3">
                {industries.map(ind => {
                  const count = attendees.filter(a => a.targetNetworkingSectors.includes(ind)).length;
                  if (count === 0) return null;
                  const pct = Math.round((count / totalCount) * 100);
                  return (
                    <div key={ind} className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600 font-bold">
                        <span>{ind}</span>
                        <span>{count} Requests</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── CRM DETAILS MODAL ────────────────── */}
      {selectedAttendee && (
        <div className="fixed inset-0 bg-[#4a0e17]/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#fdfbf7]/95 backdrop-blur-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl shadow-[#4a0e17]/20 relative border border-white/50">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#d4af37] via-[#ffd447] to-[#d4af37]" />
            
            {/* Modal header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl border border-gray-250 overflow-hidden flex items-center justify-center bg-gray-50">
                  {selectedAttendee.profilePhoto ? (
                    <img src={selectedAttendee.profilePhoto} alt={selectedAttendee.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <FaUser size={24} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedAttendee.fullName}</h2>
                  <p className="text-sm font-bold text-amber-500">{selectedAttendee.jobTitle} @ {selectedAttendee.companyName}</p>
                  <p className="text-xs text-gray-500">{selectedAttendee.city}, {selectedAttendee.country} | {selectedAttendee.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAttendee(null)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {(() => {
                const dupes = getDuplicatesFor(selectedAttendee);
                if (dupes.length === 0) return null;
                return (
                  <div className="col-span-12 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in mb-2">
                    <div className="flex gap-2.5">
                      <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0" size={18} />
                      <div>
                        <h4 className="text-sm font-bold text-amber-900">Potential Duplicate Submission Detected</h4>
                        <p className="text-xs text-amber-700 font-light mt-0.5">
                          This visionary has registered {dupes.length} other times with matching details ({dupes.map(d => `${d.fullName} - ${d.email}`).join(', ')}).
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you absolutely sure you want to purge this duplicate dossier for ${selectedAttendee.fullName}? This operation will remove it from the Supabase CRM instantly.`)) {
                          try {
                            await yenegeUnityApi.deleteAttendee(selectedAttendee.id);
                            setAttendees(prev => prev.filter(a => a.id !== selectedAttendee.id));
                            setSelectedAttendee(null);
                          } catch (err) {
                            console.error(err);
                            alert("Failed to delete this duplicate entry from the database.");
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition duration-200 shrink-0 shadow-sm"
                    >
                      Purge This Duplicate
                    </button>
                  </div>
                );
              })()}

              {/* Left Column: Details dossier */}
              <div className="md:col-span-7 space-y-6">
                {/* Business description */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                  <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest text-[#4a0e17]">Business Description</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedAttendee.businessDescription}
                  </p>
                </div>

                {/* Networking targets */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                    <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest text-amber-600">Networking Targets</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Goals</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedAttendee.selectedGoals.map(g => (
                            <span key={g} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{g}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Industries</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedAttendee.targetNetworkingSectors.map(s => (
                            <span key={s} className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                    <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest text-emerald-600">Value Offering</h4>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">"{selectedAttendee.valueOffer}"</p>
                  </div>
                </div>

                {/* Match overlap recommendations */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest flex items-center gap-2">
                    <FaUsers className="text-blue-500" /> Direct Table Overlaps
                  </h4>
                  <div className="space-y-3">
                    {getMatchSuggestions(selectedAttendee).slice(0, 3).map(oth => (
                      <div key={oth.id} className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl flex items-center justify-between transition-all hover:shadow-md hover:bg-white group">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="font-bold text-sm text-gray-900 truncate">{oth.fullName} <span className="text-gray-400 font-normal">({oth.companyName})</span></p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold uppercase tracking-wider">{oth.industry}</span>
                            <span className="text-xs text-gray-400 truncate">Wants: <span className="font-medium text-gray-600">{oth.targetNetworkingSectors.join(', ')}</span></span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const matchingCircle = groups[0];
                            if (matchingCircle) {
                              handleAddAttendeeToGroup(matchingCircle.id, selectedAttendee.id);
                              handleAddAttendeeToGroup(matchingCircle.id, oth.id);
                              alert(`Seated ${selectedAttendee.fullName} and ${oth.fullName} together in "${matchingCircle.name}"!`);
                            }
                          }}
                          className="shrink-0 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Seat Together
                        </button>
                      </div>
                    ))}
                    {getMatchSuggestions(selectedAttendee).length === 0 && (
                      <p className="text-sm text-gray-400 italic text-center py-4">No immediate overlap recommendations found.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: CRM Operations */}
              <div className="md:col-span-5 space-y-6">
                
                {/* Status selector */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                  <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest">Application Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(['pending', 'reviewed', 'accepted', 'rejected'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(selectedAttendee.id, st)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border-2 ${
                          selectedAttendee.status === st 
                            ? st === 'accepted' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                            : st === 'rejected' ? 'bg-red-50 border-red-500 text-red-700 shadow-sm'
                            : st === 'reviewed' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                            : 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm'
                          : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CRM parameters */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest">Pipeline Details</h4>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                      <span className="text-sm font-semibold text-gray-700">Called Team Status</span>
                      <select
                        value={selectedAttendee.calledStatus}
                        onChange={(e) => handleUpdateCRMField(selectedAttendee.id, 'calledStatus', e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#4a0e17] outline-none cursor-pointer hover:bg-gray-100 transition"
                      >
                        <option value="not_called">Not Called</option>
                        <option value="called">Called</option>
                        <option value="no_answer">No Answer</option>
                        <option value="left_message">Left Message</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center group">
                      <span className="text-sm font-semibold text-gray-700">Interest Level</span>
                      <select
                        value={selectedAttendee.interestLevel}
                        onChange={(e) => handleUpdateCRMField(selectedAttendee.id, 'interestLevel', e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#4a0e17] outline-none cursor-pointer hover:bg-gray-100 transition"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="vip">VIP</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center group">
                      <span className="text-sm font-semibold text-gray-700">Payment Status</span>
                      <select
                        value={selectedAttendee.paymentStatus}
                        onChange={(e) => handleUpdateCRMField(selectedAttendee.id, 'paymentStatus', e.target.value)}
                        className={`border rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-[#4a0e17] outline-none cursor-pointer transition ${
                          selectedAttendee.paymentStatus === 'paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          selectedAttendee.paymentStatus === 'waived' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                          'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="waived">Waived</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-amber-600 transition">Follow-up needed</span>
                        <div className="relative inline-block w-10 h-5">
                          <input
                            type="checkbox"
                            checked={selectedAttendee.followUpNeeded}
                            onChange={(e) => handleUpdateCRMField(selectedAttendee.id, 'followUpNeeded', e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                        </div>
                      </label>

                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition">Confirmed Attendance</span>
                        <div className="relative inline-block w-10 h-5">
                          <input
                            type="checkbox"
                            checked={selectedAttendee.confirmedAttendance}
                            onChange={(e) => handleUpdateCRMField(selectedAttendee.id, 'confirmedAttendance', e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                        </div>
                      </label>

                      <label className="flex items-center justify-between cursor-pointer group">
                        <div>
                          <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-600 transition block">Welcome Email Sent?</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">Manual tracking for access code</span>
                        </div>
                        <div className="relative inline-block w-10 h-5">
                          <input
                            type="checkbox"
                            checked={selectedAttendee.welcomeEmailSent || false}
                            onChange={(e) => handleUpdateCRMField(selectedAttendee.id, 'welcomeEmailSent', e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Tags management */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                  <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest">Dossier Tags</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedAttendee.tags.map(t => (
                      <span key={t} className="px-2.5 py-1 bg-gray-900 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                        {t}
                        <button onClick={() => handleRemoveTag(selectedAttendee.id, t)} className="text-gray-400 hover:text-white font-bold transition">✕</button>
                      </span>
                    ))}
                    {selectedAttendee.tags.length === 0 && <span className="text-xs text-gray-400 italic">No tags applied</span>}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#4a0e17] outline-none"
                    >
                      <option value="">Choose Tag...</option>
                      {availableTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAddTag(selectedAttendee.id)}
                      className="px-4 py-2 bg-[#4a0e17] text-white text-sm font-bold rounded-xl hover:bg-[#6b1422] transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-[#4a0e17]/20"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Communication logs */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest">CRM Activity Log</h4>
                  
                  {/* Comm logging form */}
                  <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                    <select
                      value={commType}
                      onChange={(e) => setCommType(e.target.value as any)}
                      className="px-2 py-1.5 bg-transparent border-none text-sm text-gray-700 font-medium focus:ring-0 outline-none cursor-pointer"
                    >
                      <option value="call">📞 Call</option>
                      <option value="email">✉️ Email</option>
                      <option value="whatsapp">💬 WA</option>
                      <option value="note">📝 Note</option>
                    </select>
                    <div className="w-px bg-gray-200 my-1"></div>
                    <input
                      type="text"
                      placeholder="Add an outcome or note..."
                      value={commNote}
                      onChange={(e) => setCommNote(e.target.value)}
                      className="flex-1 px-2 py-1.5 bg-transparent border-none text-sm focus:ring-0 outline-none"
                    />
                    <button
                      onClick={() => handleAddCommLog(selectedAttendee.id)}
                      className="px-4 py-1.5 bg-[#4a0e17] text-white text-xs font-bold rounded-lg hover:bg-[#6b1422] transition-colors"
                    >
                      Post
                    </button>
                  </div>

                  {/* Comm history list */}
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedAttendee.communicationHistory?.map((c, i) => (
                      <div key={i} className="pl-4 border-l-2 border-gray-200 relative pb-1">
                        <div className="absolute w-2 h-2 bg-gray-300 rounded-full -left-[5px] top-1.5 border-2 border-white"></div>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                            {c.type === 'call' ? '📞' : c.type === 'email' ? '✉️' : c.type === 'whatsapp' ? '💬' : '📝'} 
                            {c.userName}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{c.note}</p>
                      </div>
                    ))}
                    {(!selectedAttendee.communicationHistory || selectedAttendee.communicationHistory.length === 0) && (
                      <div className="text-center py-6 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-xs text-gray-400 font-medium">No activity logged yet.</p>
                        <p className="text-[10px] text-gray-400 mt-1">Add a note above to track interactions.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
