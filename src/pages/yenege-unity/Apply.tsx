import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaBriefcase, FaBullseye, FaLightbulb, FaCheckCircle, FaSpinner, FaArrowLeft, FaArrowRight, FaCamera, FaCalendarAlt } from 'react-icons/fa';
import { yenegeUnityApi } from '../../services/yenegeUnityApi';

export default function YenegeUnityApply() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState<'email' | 'phone' | null>(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    participantType: '' as 'Investor' | 'Company' | 'Individual' | '',
    fullName: '',
    profilePhoto: '',
    gender: 'Male',
    ageRange: '25-34',
    phone: '',
    email: '',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    
    jobTitle: '',
    companyName: '',
    industry: 'Technology',
    yearsOfExperience: 3,
    companySize: '10-49',
    website: '',
    linkedin: '',
    businessDescription: '',
    
    whyAttend: '',
    opportunitiesSought: '',
    targetPeoples: '',
    selectedGoals: [] as string[],
    
    biggestChallenge: '',
    currentGoals: '',
    valueOffer: '',
    customValueOffer: '',
    partnershipsOpen: '',
    targetNetworkingSectors: [] as string[],
    connectionPurpose: [] as string[],
    
    eventExpectations: '',
    networkingStyle: 'structured' as 'structured' | 'informal' | 'mix',
    sessionsInterest: [] as string[],
    sponsorshipInterest: false
  });

  // Industry sectors list
  const industries = [
    'Technology', 'Finance', 'Manufacturing', 'Construction', 'Real Estate', 
    'Media', 'Marketing', 'Hospitality', 'Fashion', 'Agriculture', 'Healthcare', 
    'Education', 'NGO', 'Government', 'Event Industry', 'Creative Arts', 
    'Logistics', 'E-commerce', 'Consulting', 'Telecommunications', 'Energy', 
    'Tourism', 'Food & Beverage'
  ];

  // Networking goals list
  const goalsOptions = [
    'Find clients', 'Find investors', 'Business partnerships', 'Hiring', 
    'Collaboration', 'Learning', 'Startup exposure', 'Creative networking', 'Brand promotion'
  ];

  // Connection Purpose options
  const purposeOptions = [
    'Business partnerships', 'Finding clients', 'Finding suppliers', 
    'Investment opportunities', 'Hiring talent', 'Collaboration', 
    'Sponsorship', 'Distribution', 'Learning', 'Mentorship', 
    'Brand partnerships', 'Creative collaboration'
  ];

  // Value contribution list
  const valueOptions = [
    'Funding', 'Marketing services', 'Technology solutions', 'Manufacturing', 
    'Distribution', 'Design services', 'Media exposure', 'Mentorship', 
    'Training', 'Creative services', 'Business consulting'
  ];

  // Age options
  const ageOptions = ['18-24', '25-34', '35-44', '45-54', '55+'];

  const companySizes = ['1-9', '10-49', '50-200', '200-500', '500+'];

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const toggleArrayItem = (fieldName: 'selectedGoals' | 'targetNetworkingSectors' | 'connectionPurpose' | 'sessionsInterest', item: string) => {
    setFormData(prev => {
      const arr = prev[fieldName] as string[];
      if (arr.includes(item)) {
        return { ...prev, [fieldName]: arr.filter(i => i !== item) };
      } else {
        return { ...prev, [fieldName]: [...arr, item] };
      }
    });
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = () => {
    if (step === 1) {
      return formData.participantType && formData.fullName && formData.phone && formData.email && formData.city;
    }
    if (step === 2) {
      return formData.jobTitle && formData.companyName;
    }
    if (step === 3) {
      return formData.whyAttend && formData.opportunitiesSought && formData.selectedGoals.length > 0;
    }
    if (step === 4) {
      return formData.valueOffer && formData.targetNetworkingSectors.length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      alert('Please fill out all required fields before proceeding.');
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsSubmitting(true);
    setDuplicateMessage(null);
    try {
      // Merge valueOffer and customValueOffer if present
      const finalValueOffer = formData.valueOffer + 
        (formData.customValueOffer ? `, ${formData.customValueOffer}` : '');

      await yenegeUnityApi.createAttendee({
        ...formData,
        valueOffer: finalValueOffer
      });

      // Simulation of email notification
      console.log('Sending confirmation email to: ', formData.email);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      if (err.message === 'DUPLICATE_EMAIL') {
        setDuplicateMessage('email');
      } else if (err.message === 'DUPLICATE_PHONE') {
        setDuplicateMessage('phone');
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (duplicateMessage) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-[#150000] border border-amber-500/30 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(217,119,6,0.15)] relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
          
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 mx-auto">
            <FaBullseye size={48} className="animate-pulse text-amber-500" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-500 font-serif">
            ማመልከቻዎ አስቀድሞ ተመዝግቧል<br/>
            <span className="text-xl sm:text-2xl font-sans mt-2 block opacity-80">Application Already Exists</span>
          </h1>
          
          <div className="space-y-4 text-gray-300 font-medium text-sm leading-relaxed text-left max-w-lg mx-auto">
            <p className="bg-[#2a0000]/40 border-l-4 border-amber-500 p-4 rounded-r-xl">
              በስርዓታችን ላይ ባደረግነው ማረጋገጫ፣ {duplicateMessage === 'email' ? (
                <>በኢሜይል አድራሻ <span className="text-white font-bold">{formData.email}</span></>
              ) : (
                <>በስልክ ቁጥር <span className="text-white font-bold">{formData.phone}</span></>
              )} አስቀድሞ የተመዘገበ ማመልከቻ አግኝተናል።
            </p>
            
            <p className="bg-[#2a0000]/40 border-l-4 border-amber-500/50 p-4 rounded-r-xl text-gray-400">
              Our records indicate that an active registration already exists under {duplicateMessage === 'email' ? (
                <>the email <span className="text-white font-semibold">{formData.email}</span></>
              ) : (
                <>the phone number <span className="text-white font-semibold">{formData.phone}</span></>
              )}.
            </p>

            <div className="bg-[#1a0000] border border-amber-500/20 p-4 rounded-2xl text-xs mt-6 text-center shadow-inner">
              <p className="text-amber-400 font-bold mb-1">📞 ተጨማሪ መረጃ ከፈለጉ (Need Help?)</p>
              <p className="text-gray-400">እባክዎ የነገ ዩኒቲ አዘጋጆችን በ <span className="text-white">+251 978 639 887</span> ያግኙ።</p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/yenege-unity"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-center transition duration-200"
            >
              Return to Summit Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-[#150000] border border-amber-500/30 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(217,119,6,0.15)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
          
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 mx-auto">
            <FaCheckCircle size={48} className="animate-bounce" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white">
            ማመልከቻዎ ደርሶናል<br/>
            <span className="text-xl sm:text-2xl font-sans mt-2 block opacity-80 text-amber-400">Application Received</span>
          </h1>
          
          <div className="space-y-5 text-gray-300 font-medium text-sm leading-relaxed text-left max-w-lg mx-auto">
            <div className="bg-[#2a0000]/60 border border-amber-500/20 p-5 rounded-2xl space-y-3">
              <p>
                ክቡር/ርት <span className="text-white font-bold">{formData.fullName}</span>፣ የነገ ዩኒቲ ማመልከቻዎትን በተሳካ ሁኔታ ተቀብለናል።
              </p>
              <p className="text-xs text-amber-500/90 font-bold">
                ✓ ኮሚቴያችን መረጃዎትን በማጥናት ላይ ይገኛል።
              </p>
              <p>
                በቀጣይ 48 ሰዓታት ውስጥ በስልክ ቁጥር <span className="text-white font-bold">{formData.phone}</span> ደውለን ዝርዝር መረጃዎችን የምንለዋወጥ ይሆናል።
              </p>
            </div>

            <div className="bg-[#1a0000] border-l-4 border-amber-500/30 p-4 rounded-r-2xl space-y-2 text-gray-400 text-xs sm:text-sm">
              <p>
                Thank you, <span className="text-white font-semibold">{formData.fullName}</span>. Your application for Yenege Unity has been successfully submitted.
              </p>
              <p>
                Our executive committee is currently reviewing your profile. A representative will contact you at <span className="text-white font-semibold">{formData.phone}</span> within 48 hours to discuss your matchmaking preferences.
              </p>
              <p className="mt-2 pt-2 border-t border-white/5">
                📧 A confirmation receipt has been sent to <span className="text-white">{formData.email}</span>.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/yenege-unity"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-center transition duration-200"
            >
              Return to Summit Page
            </Link>
            <Link
              to="/yenege-unity/portal"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black rounded-xl text-center shadow-lg shadow-amber-500/15 hover:scale-[1.02] transition duration-200"
            >
              Check Application Status
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stepsList = [
    { label: 'Personal', icon: FaUser },
    { label: 'Professional', icon: FaBriefcase },
    { label: 'Networking', icon: FaBullseye },
    { label: 'Matchmaking', icon: FaLightbulb },
    { label: 'Review', icon: FaCheckCircle }
  ];

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 z-10 relative">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/yenege-unity" className="text-xs text-amber-500 uppercase tracking-widest hover:text-amber-400">
            ← Back to Summit Page
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Executive Dossier Application</h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Provide deep business intelligence to help organizers pre-arrange your networking connections.
          </p>
        </div>

        {/* Stepper progress */}
        {/* Mobile stepper progress bar */}
        <div className="md:hidden w-full bg-[#150000] border border-amber-500/5 p-4 rounded-2xl flex flex-col gap-3 shadow-lg">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Step {step} of 5</span>
              <p className="text-sm font-black text-white mt-0.5">{stepsList[step - 1]?.label || 'Review'}</p>
            </div>
            <span className="text-xs font-bold text-gray-500">{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-black h-2 rounded-full overflow-hidden shadow-inner border border-amber-500/10">
            <div 
              className="bg-gradient-to-r from-amber-500 to-yellow-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop stepper */}
        <div className="hidden md:flex justify-between items-center bg-[#150000] border border-amber-500/5 p-4 rounded-2xl shadow-lg">
          {stepsList.map((s, idx) => {
            const stepNum = idx + 1;
            const Icon = s.icon;
            const isCompleted = stepNum < step;
            const isActive = stepNum === step;
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isCompleted ? 'bg-amber-500 border-amber-500 text-black' :
                  isActive ? 'bg-white border-white text-black ring-4 ring-white/10' :
                  'bg-[#2a0000] border-amber-500/10 text-gray-500'
                }`}>
                  <Icon size={12} />
                </div>
                <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>{s.label}</span>
                {idx < stepsList.length - 1 && (
                  <div className="w-8 h-[2px] bg-white/5 mx-2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-[#150000] border border-amber-500/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-t-3xl" />
          
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Step {step} of 5</span>
            <span className="text-xs text-gray-500 font-medium">Fields marked * are required</span>
          </div>

          {/* STEP 1: PERSONAL INFORMATION */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaUser className="text-amber-500" /> Personal Identity
              </h3>

              {/* Participant Type Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-300">I am joining as... *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['Investor', 'Company', 'Individual'] as const).map(type => {
                    const icons: Record<string, string> = { Investor: '💼', Company: '🏢', Individual: '👤' };
                    const descs: Record<string, string> = {
                      Investor: 'Angel / VC / Fund',
                      Company: 'Business / Startup',
                      Individual: 'Professional / Freelancer'
                    };
                    const selected = formData.participantType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, participantType: type }))}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-center ${
                          selected
                            ? 'bg-amber-500/15 border-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.2)]'
                            : 'bg-[#2a0000]/60 border-amber-500/10 hover:border-amber-500/30'
                        }`}
                      >
                        <span className="text-2xl">{icons[type]}</span>
                        <span className={`text-sm font-black tracking-wide ${selected ? 'text-amber-400' : 'text-white'}`}>{type}</span>
                        <span className="text-[10px] text-gray-500 leading-tight">{descs[type]}</span>
                        {selected && <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">✓ Selected</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    placeholder="e.g. Sara Abraham"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Age Range *</label>
                  <select
                    name="ageRange"
                    value={formData.ageRange}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                  >
                    {ageOptions.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                    placeholder="e.g. +251 911 203 405"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                    placeholder="your.email@company.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleTextChange}
                      className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                      placeholder="Addis Ababa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Country *</label>
                    <input
                      type="text"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleTextChange}
                      className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                      placeholder="Ethiopia"
                    />
                  </div>
                </div>
              </div>

              {/* Profile image picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Profile Photo (Optional)</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-white/10 bg-black flex items-center justify-center text-gray-500 overflow-hidden relative">
                    {formData.profilePhoto ? (
                      <img src={formData.profilePhoto} alt="Upload Preview" className="w-full h-full object-cover" />
                    ) : (
                      <FaCamera size={24} />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id="photo-upload"
                      className="hidden"
                      onChange={handleProfilePhotoChange}
                    />
                    <label
                      htmlFor="photo-upload"
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold cursor-pointer hover:bg-white/10 transition"
                    >
                      Choose Image File
                    </label>
                    <p className="text-[10px] text-gray-500 mt-2">JPEG, PNG up to 2MB. Square crop recommended.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROFESSIONAL INFORMATION */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaBriefcase className="text-amber-500" /> Professional Dossier
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Job Title *</label>
                  <input
                    type="text"
                    name="jobTitle"
                    required
                    value={formData.jobTitle}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                    placeholder="e.g. Chief Executive Officer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Company / Startup Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                    placeholder="e.g. Quanta Technologies"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Industry Sector *</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                  >
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Years of Exp *</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      required
                      value={formData.yearsOfExperience}
                      onChange={handleNumberChange}
                      min="0"
                      className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Company Size *</label>
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleTextChange}
                      className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                    >
                      {companySizes.map(sz => (
                        <option key={sz} value={sz}>{sz} Employees</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Website URL (Optional)</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                    placeholder="https://company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">LinkedIn Profile URL (Optional)</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Brief Business Description <span className="text-gray-600 font-normal">(Optional)</span></label>
                <textarea
                  name="businessDescription"
                  rows={3}
                  value={formData.businessDescription}
                  onChange={handleTextChange}
                  className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                  placeholder="Briefly describe what your company does..."
                />
              </div>
            </div>
          )}

          {/* STEP 3: NETWORKING OBJECTIVES */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaBullseye className="text-amber-500" /> Networking Objectives
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Why are you attending? *</label>
                  <select
                    name="whyAttend"
                    value={formData.whyAttend}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                  >
                    <option value="">Select your main reason...</option>
                    <option value="Find business partners">Find business partners</option>
                    <option value="Raise investment / funding">Raise investment / funding</option>
                    <option value="Find clients & sales leads">Find clients &amp; sales leads</option>
                    <option value="Hire talent">Hire talent</option>
                    <option value="Learn & get inspired">Learn &amp; get inspired</option>
                    <option value="Promote my brand">Promote my brand</option>
                    <option value="Explore collaborations">Explore collaborations</option>
                    <option value="Network & expand connections">Network &amp; expand connections</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">What are you looking for? *</label>
                  <select
                    name="opportunitiesSought"
                    value={formData.opportunitiesSought}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                  >
                    <option value="">Select primary opportunity...</option>
                    <option value="Investors / Funding">Investors / Funding</option>
                    <option value="Distribution partners">Distribution partners</option>
                    <option value="Technology partners">Technology partners</option>
                    <option value="Manufacturing suppliers">Manufacturing suppliers</option>
                    <option value="Sales agents / Clients">Sales agents / Clients</option>
                    <option value="Co-founders / Team members">Co-founders / Team members</option>
                    <option value="Mentors / Advisors">Mentors / Advisors</option>
                    <option value="Media & PR exposure">Media &amp; PR exposure</option>
                    <option value="General networking">General networking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Your networking goals * <span className="text-gray-500 font-normal">(pick all that apply)</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {goalsOptions.map(goal => {
                      const selected = formData.selectedGoals.includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleArrayItem('selectedGoals', goal)}
                          className={`p-2.5 text-left rounded-xl border text-xs font-bold transition duration-200 ${
                            selected
                              ? 'bg-amber-500 border-amber-500 text-black'
                              : 'bg-black border-white/10 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          {goal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: BUSINESS MATCHMAKING INTELLIGENCE */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaLightbulb className="text-amber-500" /> Business Matchmaking
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">What can you offer other attendees? *</label>
                  <select
                    name="valueOffer"
                    value={formData.valueOffer}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                  >
                    <option value="">Select your primary offering...</option>
                    {valueOptions.map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Your biggest business challenge <span className="text-gray-600 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    name="biggestChallenge"
                    value={formData.biggestChallenge}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-[#2a0000] border border-amber-500/10 rounded-xl focus:ring-2 focus:ring-amber-400 text-white"
                    placeholder="e.g. Finding suppliers, scaling distribution..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Which sectors do you want to connect with? * <span className="text-gray-500 font-normal">(pick all that apply)</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto p-2 bg-[#2a0000] border border-amber-500/10 rounded-xl">
                    {industries.map(ind => {
                      const selected = formData.targetNetworkingSectors.includes(ind);
                      return (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => toggleArrayItem('targetNetworkingSectors', ind)}
                          className={`p-2 text-left rounded-lg text-[10px] font-bold border transition duration-150 ${
                            selected
                              ? 'bg-amber-500 border-amber-500 text-black'
                              : 'bg-black border-transparent text-gray-400 hover:border-white/10'
                          }`}
                        >
                          {ind}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaCheckCircle className="text-amber-500" /> Review Your Application
              </h3>

              <div className="bg-[#2a0000]/60 border border-amber-500/5 p-6 rounded-2xl space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-white/5 pb-6">
                  <div className="w-20 h-20 rounded-2xl bg-neutral-900 border border-amber-500/20 overflow-hidden flex items-center justify-center text-gray-500 flex-shrink-0">
                    {formData.profilePhoto ? (
                      <img src={formData.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser size={32} />
                    )}
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="text-xl font-bold text-white">{formData.fullName || 'Unnamed'}</h4>
                    <p className="text-sm text-amber-400 font-medium">{formData.jobTitle} at {formData.companyName}</p>
                    <p className="text-xs text-gray-500">{formData.city}, {formData.country} · {formData.phone}</p>
                    {formData.participantType && (
                      <span className="inline-block px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                        {formData.participantType}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Industry</span>
                      <p className="text-white font-medium mt-1">{formData.industry} · {formData.companySize} employees</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Goals</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {formData.selectedGoals.map(g => (
                          <span key={g} className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-[10px] font-bold">{g}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Target Sectors</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {formData.targetNetworkingSectors.map(s => (
                          <span key={s} className="px-2 py-1 bg-white/5 text-gray-300 rounded-lg text-[10px] font-bold">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">What I Offer</span>
                      <p className="text-white font-medium mt-1">{formData.valueOffer}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Why Attending</span>
                      <p className="text-gray-400 font-light mt-1">{formData.whyAttend}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 text-xs text-gray-500 space-y-1.5">
                  <p>✓ By submitting, you authorize Yenege Unity to verify your credentials and add you to the matchmaking database.</p>
                  <p>✓ A team member will contact you within 48 hours to confirm your details.</p>
                </div>
              </div>
            </div>
          )}


          {/* Navigation Controls */}
          <div className="flex justify-between items-center border-t border-white/5 pt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold flex items-center gap-2 transition"
              >
                <FaArrowLeft size={12} /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/15 hover:scale-[1.02] active:scale-95 transition"
              >
                Continue <FaArrowRight size={12} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" /> Ingesting Dossier...
                  </>
                ) : (
                  <>
                    Submit Executive Application
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
