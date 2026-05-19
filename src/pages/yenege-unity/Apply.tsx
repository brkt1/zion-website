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
      return formData.fullName && formData.phone && formData.email && formData.city;
    }
    if (step === 2) {
      return formData.jobTitle && formData.companyName && formData.businessDescription;
    }
    if (step === 3) {
      return formData.whyAttend && formData.selectedGoals.length > 0;
    }
    if (step === 4) {
      return formData.biggestChallenge && formData.targetNetworkingSectors.length > 0;
    }
    if (step === 5) {
      return formData.eventExpectations;
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
        <div className="max-w-xl w-full bg-neutral-900 border border-amber-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
          
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 mx-auto">
            <FaBullseye size={48} className="animate-pulse text-amber-500" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-amber-500">Dossier Already Active</h1>
          
          <div className="space-y-3 text-gray-400 font-light text-sm leading-relaxed">
            <p>
              Our database indicates that an active registration dossier is already registered under {duplicateMessage === 'email' ? (
                <>the email <span className="text-white font-semibold">{formData.email}</span></>
              ) : (
                <>the phone number <span className="text-white font-semibold">{formData.phone}</span></>
              )}.
            </p>
            <p>
              To ensure event curation standards, our vetting committee only reviews one primary application per professional visionary.
            </p>
            <p className="bg-black/40 border border-white/5 p-4 rounded-2xl text-xs text-left leading-relaxed">
              💬 <strong className="text-white">Current Status:</strong> Your profile is currently under review by our executive matchmaking panel. If you need to update any business metrics, target sectors, or professional details, please contact the <strong className="text-white">Yenege Unity Event Desk</strong> directly.
            </p>
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
        <div className="max-w-xl w-full bg-neutral-900 border border-amber-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
          
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 mx-auto">
            <FaCheckCircle size={48} className="animate-bounce" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">Application Dossier Received</h1>
          
          <div className="space-y-3 text-gray-400 font-light text-sm leading-relaxed">
            <p>
              Thank you, <span className="text-white font-semibold">{formData.fullName}</span>. Your professional registration profile has been successfully ingested into the Yenege Unity Networking CRM.
            </p>
            <p>
              Our committee is manually reviewing your target sectors: <span className="text-amber-400">{formData.targetNetworkingSectors.join(', ')}</span>.
            </p>
            <p className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs text-left">
              📧 A confirmation email has been dispatched to <span className="text-white font-medium">{formData.email}</span>. A Call Team representative will dial <span className="text-white font-medium">{formData.phone}</span> within 48 business hours to verify your details and set up your pre-arranged meeting slots.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/yenege-unity"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-center transition duration-200"
            >
              Return to Summit Page
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black rounded-xl text-center shadow-lg shadow-amber-500/15 hover:scale-[1.02] transition duration-200"
            >
              Explore Yenege Website
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
    { label: 'Insights', icon: FaLightbulb },
    { label: 'Expectations', icon: FaCalendarAlt },
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
        <div className="hidden md:flex justify-between items-center bg-neutral-900 border border-white/5 p-4 rounded-2xl">
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
                  'bg-neutral-950 border-white/10 text-gray-500'
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
        <form onSubmit={handleSubmit} className="bg-neutral-900 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-t-3xl" />
          
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Step {step} of 6</span>
            <span className="text-xs text-gray-500 font-medium">Fields marked * are required</span>
          </div>

          {/* STEP 1: PERSONAL INFORMATION */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaUser className="text-amber-500" /> Personal Identity
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    placeholder="e.g. Sara Abraham"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
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
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
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
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
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
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                    placeholder="your.email@company.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleTextChange}
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
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
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
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
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
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
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                    placeholder="e.g. Quanta Technologies"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Industry Sector *</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                  >
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Years of Exp *</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      required
                      value={formData.yearsOfExperience}
                      onChange={handleNumberChange}
                      min="0"
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Company Size *</label>
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleTextChange}
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
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
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
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
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Brief Business Description *</label>
                <textarea
                  name="businessDescription"
                  required
                  rows={4}
                  value={formData.businessDescription}
                  onChange={handleTextChange}
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                  placeholder="Describe your core company products, operations footprint, and target consumer market..."
                />
              </div>
            </div>
          )}

          {/* STEP 3: NETWORKING GOALS */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaBullseye className="text-amber-500" /> Networking Objectives
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Why do you want to attend Yenege Unity? *</label>
                  <textarea
                    name="whyAttend"
                    required
                    rows={3}
                    value={formData.whyAttend}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                    placeholder="Detail your personal motivation and expectations from this summit..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">What specific opportunities are you looking for? *</label>
                  <textarea
                    name="opportunitiesSought"
                    required
                    rows={3}
                    value={formData.opportunitiesSought}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                    placeholder="e.g. Seed round investment, enterprise software distributors, eco-packaging manufacturers..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">What type of people do you want to meet? *</label>
                  <input
                    type="text"
                    name="targetPeoples"
                    required
                    value={formData.targetPeoples}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                    placeholder="e.g. Venture capitalists, Manufacturing COOs, Creative directors..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Select your Primary Networking Goals * (Select all that apply)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {goalsOptions.map(goal => {
                      const selected = formData.selectedGoals.includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleArrayItem('selectedGoals', goal)}
                          className={`p-3 text-left rounded-xl border text-xs font-bold transition duration-200 ${
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

          {/* STEP 4: BUSINESS INSIGHTS */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaLightbulb className="text-amber-500" /> Business Matchmaking Intelligence
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">What is your biggest business or operational challenge? *</label>
                  <textarea
                    name="biggestChallenge"
                    required
                    rows={3}
                    value={formData.biggestChallenge}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                    placeholder="e.g. Finding high-quality manufacturing suppliers, local product manager recruitment, regulatory lobbying..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">What are your current short-term business goals? *</label>
                  <input
                    type="text"
                    name="currentGoals"
                    required
                    value={formData.currentGoals}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                    placeholder="e.g. Secure 10 new clients, complete Solar grid integration..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">What can you offer/contribute to other attendees? *</label>
                    <select
                      name="valueOffer"
                      value={formData.valueOffer}
                      onChange={handleTextChange}
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                    >
                      <option value="">Select primary offering...</option>
                      {valueOptions.map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Custom Offering (Optional)</label>
                    <input
                      type="text"
                      name="customValueOffer"
                      value={formData.customValueOffer}
                      onChange={handleTextChange}
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                      placeholder="e.g. Free API credits, legal drafting..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">What partnerships or collaborations are you open to? *</label>
                  <input
                    type="text"
                    name="partnershipsOpen"
                    required
                    value={formData.partnershipsOpen}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                    placeholder="e.g. Co-investments, brand crossover capsules, technology integrations..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Which sectors do you want to connect with? * (Select all that apply)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-black border border-white/10 rounded-xl scrollbar-thin">
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

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Why do you want to connect with these sectors? * (Connection Purpose)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {purposeOptions.map(pur => {
                      const selected = formData.connectionPurpose.includes(pur);
                      return (
                        <label key={pur} className="flex items-center gap-3 p-3 bg-black border border-white/5 rounded-xl cursor-pointer hover:border-white/10 text-xs">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleArrayItem('connectionPurpose', pur)}
                            className="rounded border-white/10 bg-black text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-gray-300">{pur}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: EVENT EXPECTATIONS */}
          {step === 5 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaCalendarAlt className="text-amber-500" /> Event Settings & Sponsorship
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">What do you expect to achieve at the event? *</label>
                  <textarea
                    name="eventExpectations"
                    required
                    rows={4}
                    value={formData.eventExpectations}
                    onChange={handleTextChange}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 text-white"
                    placeholder="Outline your target deliverables (e.g. 5 investor meetings scheduled, 2 technology supplier partners shortlisted)..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Preferred Networking Style *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="p-4 bg-black border border-white/10 rounded-xl cursor-pointer flex flex-col gap-2 hover:border-amber-500/50">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs">Structured Matchmaking</span>
                        <input
                          type="radio"
                          name="networkingStyle"
                          value="structured"
                          checked={formData.networkingStyle === 'structured'}
                          onChange={handleTextChange}
                          className="text-amber-500 focus:ring-amber-500"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">Curated networking tables and scheduled C-suite 1-on-1s.</p>
                    </label>

                    <label className="p-4 bg-black border border-white/10 rounded-xl cursor-pointer flex flex-col gap-2 hover:border-amber-500/50">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs">Informal Lounge</span>
                        <input
                          type="radio"
                          name="networkingStyle"
                          value="informal"
                          checked={formData.networkingStyle === 'informal'}
                          onChange={handleTextChange}
                          className="text-amber-500 focus:ring-amber-500"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">Organic cocktail gatherings, receptions, and lounge interactions.</p>
                    </label>

                    <label className="p-4 bg-black border border-white/10 rounded-xl cursor-pointer flex flex-col gap-2 hover:border-amber-500/50">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs">Mixed Style</span>
                        <input
                          type="radio"
                          name="networkingStyle"
                          value="mix"
                          checked={formData.networkingStyle === 'mix'}
                          onChange={handleTextChange}
                          className="text-amber-500 focus:ring-amber-500"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">Structured table sessions followed by open terrace receptions.</p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Which sessions are you interested in?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Tech & Industrial Plenary', 'Venture Capital Roundtable', 'AI Ecosystem Masterclass', '1-on-1 VIP Matchmaking Lounge'].map(sess => {
                      const selected = formData.sessionsInterest.includes(sess);
                      return (
                        <button
                          key={sess}
                          type="button"
                          onClick={() => toggleArrayItem('sessionsInterest', sess)}
                          className={`p-3 rounded-xl border text-xs font-bold text-left transition duration-200 ${
                            selected 
                              ? 'bg-amber-500 border-amber-500 text-black' 
                              : 'bg-black border-white/10 text-gray-400'
                          }`}
                        >
                          {sess}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="sponsorshipInterest"
                    checked={formData.sponsorshipInterest}
                    onChange={(e) => setFormData(prev => ({ ...prev, sponsorshipInterest: e.target.checked }))}
                    className="rounded border-white/10 bg-black text-amber-500 focus:ring-amber-500 mt-1"
                  />
                  <div>
                    <label htmlFor="sponsorshipInterest" className="font-bold text-sm text-white cursor-pointer">
                      I am interested in corporate sponsorship opportunities
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Check this box if your company wishes to explore exhibition spaces, branding, or VIP lounge naming rights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: APPLICATION REVIEW */}
          {step === 6 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaCheckCircle className="text-amber-500" /> Dossier Verification & Review
              </h3>

              <div className="bg-black/40 border border-white/5 p-6 rounded-2xl space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-white/5 pb-6">
                  {/* Photo Preview */}
                  <div className="w-24 h-24 rounded-2xl bg-neutral-900 border border-amber-500/20 overflow-hidden flex items-center justify-center text-gray-500 flex-shrink-0">
                    {formData.profilePhoto ? (
                      <img src={formData.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser size={36} />
                    )}
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="text-2xl font-bold text-white">{formData.fullName || 'Unnamed Applicant'}</h4>
                    <p className="text-sm text-amber-400 font-medium">{formData.jobTitle} at {formData.companyName}</p>
                    <p className="text-xs text-gray-500">{formData.city}, {formData.country} | {formData.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  {/* Core details */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Industry Vertical</span>
                      <p className="text-white font-medium mt-1">{formData.industry} ({formData.companySize} employees)</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Primary Goals</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {formData.selectedGoals.map(g => (
                          <span key={g} className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-[10px] font-bold">{g}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Target Networking Sectors</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {formData.targetNetworkingSectors.map(s => (
                          <span key={s} className="px-2 py-1 bg-white/5 text-gray-300 rounded-lg text-[10px] font-bold">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Business Insights */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Value Offering</span>
                      <p className="text-white font-medium mt-1">
                        {formData.valueOffer} {formData.customValueOffer ? `(${formData.customValueOffer})` : ''}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Major Operational Challenge</span>
                      <p className="text-gray-400 font-light mt-1 line-clamp-2">{formData.biggestChallenge}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Partnerships Open</span>
                      <p className="text-gray-400 font-light mt-1">{formData.partnershipsOpen}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6 text-xs text-gray-500 space-y-2">
                  <p>✓ By submitting, you authorize the Yenege Unity Networking committee to verify your company's credentials and log this profile in the matchmaking database.</p>
                  <p>✓ The profile photo will be prepared for executive badge printing and networking dossier reports.</p>
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

            {step < 6 ? (
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
