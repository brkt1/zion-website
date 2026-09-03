import React, { useEffect, useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiChevronDown, FiLoader, FiMapPin, FiPhone, FiSend, FiUser, FiBriefcase, FiBookOpen, FiInfo, FiCheck, FiArrowRight } from 'react-icons/fi';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { adminApi } from '../services/adminApi';
import { getActiveMasterclassSchedules, MasterclassScheduleOption } from '../services/masterclassSchedules';
import { toEthiopianDate } from '../utils/ethiopianCalendar';

const MasterclassRegistration: React.FC = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || undefined;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    sex: '',
    place: '',
    agreedToTerms: false,
    describe_you: '',
    event_types: [] as string[],
    preferred_schedule: '',
    learning_mode: '',
    opportunity_interest: [] as string[],
    marketing_source: '',
    learning_goals: '',
    contact_consent: ''
  });

  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [scheduleOptions, setScheduleOptions] = useState<MasterclassScheduleOption[]>([]);

  useEffect(() => {
    const updateOptions = () => {
      setScheduleOptions(getActiveMasterclassSchedules());
    };
    updateOptions();
    window.addEventListener('masterclass_schedules_updated', updateOptions);
    return () => window.removeEventListener('masterclass_schedules_updated', updateOptions);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for field
    if (stepErrors[name]) {
      setStepErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const toggleEventType = (type: string) => {
    setFormData(prev => {
      const exists = prev.event_types.includes(type);
      const next = exists 
        ? prev.event_types.filter(t => t !== type)
        : [...prev.event_types, type];
      return { ...prev, event_types: next };
    });
    if (stepErrors.event_types) {
      setStepErrors(prev => {
        const next = { ...prev };
        delete next.event_types;
        return next;
      });
    }
  };

  const toggleOpportunity = (opp: string) => {
    setFormData(prev => {
      const exists = prev.opportunity_interest.includes(opp);
      let next = [] as string[];
      if (opp === 'All of the above') {
        next = exists ? [] : ['All of the above'];
      } else if (opp === "I'm not sure yet") {
        next = exists ? [] : ["I'm not sure yet"];
      } else {
        const filtered = prev.opportunity_interest.filter(o => o !== 'All of the above' && o !== "I'm not sure yet");
        next = exists ? filtered.filter(o => o !== opp) : [...filtered, opp];
      }
      return { ...prev, opportunity_interest: next };
    });
    if (stepErrors.opportunity_interest) {
      setStepErrors(prev => {
        const next = { ...prev };
        delete next.opportunity_interest;
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name.trim()) errors.name = 'Full Name is required';
      if (!formData.email.trim()) {
        errors.email = 'Email Address is required for registration verification';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address (e.g. name@example.com)';
      }
      if (!formData.phone.trim()) errors.phone = 'Phone Number is required';
      if (!formData.age.trim()) errors.age = 'Age is required';
      if (!formData.sex) errors.sex = 'Please select your sex';
      if (!formData.place) errors.place = 'Please select your region';
    } else if (step === 2) {
      if (!formData.describe_you) errors.describe_you = 'Please select what best describes you';
      if (!formData.learning_mode) errors.learning_mode = 'Please select your preferred learning delivery';
      if (!formData.preferred_schedule) errors.preferred_schedule = 'Please select your preferred program schedule';
    } else if (step === 3) {
      if (formData.event_types.length === 0) errors.event_types = 'Please select at least one type of event';
      if (formData.opportunity_interest.length === 0) errors.opportunity_interest = 'Please select at least one opportunity';
      if (!formData.learning_goals.trim()) errors.learning_goals = 'Please tell us what you wish to learn or achieve';
    } else if (step === 4) {
      if (!formData.marketing_source) errors.marketing_source = 'Please select how you heard about us';
      if (!formData.contact_consent) errors.contact_consent = 'Please select your contact preference';
      if (!formData.agreedToTerms) errors.agreedToTerms = 'You must agree to the program guidelines';
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const calculateFee = () => {
    if (formData.learning_mode.includes('In-person')) return 15000;
    if (formData.learning_mode.includes('Online')) return 7000;
    if (formData.learning_mode.includes('Hybrid')) return 10000;
    return 0;
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

    const telegramText = `🎓 Masterclass Registration Summary

👤 Name: ${formData.name}
📞 Phone: ${formData.phone}
✉️ Email: ${formData.email || 'N/A'}
📅 Schedule: ${formData.preferred_schedule}
💻 Format: ${formData.learning_mode}
💰 Total Fee: ${calculateFee().toLocaleString()} ETB`;

    try {
      await adminApi.masterclassReservations.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: parseInt(formData.age),
        sex: formData.sex as 'male' | 'female',
        place: formData.place,
        referral_code: referralCode,
        describe_you: formData.describe_you,
        event_types: formData.event_types.join(', '),
        preferred_schedule: formData.preferred_schedule,
        learning_mode: formData.learning_mode,
        opportunity_interest: formData.opportunity_interest.join(', '),
        marketing_source: formData.marketing_source,
        learning_goals: formData.learning_goals,
        contact_consent: formData.contact_consent,
      });

      setIsSubmitted(true);

      // Open Telegram to @Yenegeevent with prefilled info
      window.open(`https://t.me/Yenegeevent?text=${encodeURIComponent(telegramText)}`, '_blank');
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmissionError(err?.details || err?.message || 'Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const yenegeYellow = "#FFD447";
  const coralOrange = "#FF6F5E";
  const indigoDeep = "#1C2951";

  const inputClasses = "w-full bg-[#1E293B]/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white focus:border-[#FFD447] focus:bg-[#1E293B] focus:ring-[4px] focus:ring-[#FFD447]/10 outline-none transition-all placeholder:text-slate-400 font-sans shadow-inner hover:border-white/20 duration-300 text-sm";
  const selectClasses = "w-full bg-[#1E293B]/80 border border-white/10 rounded-2xl pl-11 pr-10 py-3.5 text-white focus:border-[#FFD447] focus:bg-[#1E293B] focus:ring-[4px] focus:ring-[#FFD447]/10 outline-none transition-all font-sans shadow-inner hover:border-white/20 duration-300 appearance-none text-sm";
  const labelClasses = "block text-[10px] uppercase tracking-[0.3em] font-black text-[#FFD447] mb-1.5 ml-1 font-sans";

  const stepLabels = language === 'am' 
    ? ["ግል መረጃ", "የስልጠና ሁኔታ", "ፍላጎቶች", "ስምምነት", "ማረጋገጫ"]
    : language === 'om'
      ? ["Odeeffannoo", "Mala Leenjii", "Fedhii", "Waliigaltee", "Mirkaneessa"]
      : ["Profile", "Delivery", "Interests", "Consent", "Review"];


  const sharedStyles = `
    .font-serif { font-family: 'Outfit', 'Playfair Display', serif; }
    .font-sans  { font-family: 'Inter', 'Manrope', sans-serif; }
    .glass-vivid-light {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.5);
    }
    .text-gold-gradient {
      background: linear-gradient(135deg, ${yenegeYellow}, ${coralOrange});
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .glow-button-amber {
      background: linear-gradient(135deg, ${yenegeYellow} 0%, ${coralOrange} 100%);
      color: ${indigoDeep}; font-weight: 800;
      transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
    }
    .bg-luxury {
      background: radial-gradient(circle at top right, rgba(255,212,71,0.08) 0%, transparent 45%),
                  radial-gradient(circle at bottom left, rgba(255,111,94,0.06) 0%, transparent 45%),
                  #0F172A;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-step {
      animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `;

  if (isSubmitted) {
    const telegramText = `🎓 Masterclass Registration Summary

👤 Name: ${formData.name}
📞 Phone: ${formData.phone}
✉️ Email: ${formData.email || 'N/A'}
📅 Schedule: ${formData.preferred_schedule}
💻 Format: ${formData.learning_mode}
💰 Total Fee: ${calculateFee().toLocaleString()} ETB`;

    const tgUrl = `https://t.me/Yenegeevent?text=${encodeURIComponent(telegramText)}`;

    return (
      <div className="bg-luxury min-h-screen text-slate-900 flex items-center justify-center p-6 font-sans">
        <style>{sharedStyles}</style>
        <div className="max-w-xl w-full glass-vivid-light p-8 md:p-14 rounded-[3rem] text-center relative z-10 animate-step space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/20">
            <FiCheckCircle size={40} />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl italic tracking-tight text-slate-900 text-gold-gradient">Registration Received!</h2>
          <p className="text-slate-500 leading-relaxed font-medium text-sm">
            Thank you for submitting your <span className="text-slate-900 font-bold">Event Industry Interest &amp; Registration Form</span>. Payment instructions and options will be shared with you by our admissions team upon review.
          </p>

          {/* Email Notification Dispatch Card */}
          <div className="bg-emerald-900/90 text-white p-5 rounded-2xl text-left space-y-2.5 border border-emerald-700/50 shadow-lg">
            <div className="flex items-center justify-between border-b border-emerald-700/50 pb-2">
              <span className="text-xs text-emerald-300 font-black uppercase tracking-wider flex items-center gap-1.5">
                ✉️ Registration Confirmation Email Dispatched
              </span>
              <span className="text-[10px] font-mono bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded-md">Verified</span>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
              An official registration receipt and schedule details have been dispatched to <strong className="text-white underline">{formData.email}</strong>.
            </p>
            <a 
              href={`mailto:${formData.email}?subject=${encodeURIComponent(`Yenege Masterclass Registration Confirmation — ${formData.name}`)}&body=${encodeURIComponent(`Dear ${formData.name},\n\nThank you for registering for the Yenege Masterclass!\n\nRegistration Summary:\nName: ${formData.name}\nPhone: ${formData.phone}\nSchedule: ${formData.preferred_schedule}\nFormat: ${formData.learning_mode}\nTuition Fee: ${calculateFee().toLocaleString()} ETB\n\nAdmissions Team\nYenege Academy`)}`}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-[11px] uppercase tracking-wider transition-all"
            >
              <span>📩 View Confirmation Email Receipt</span>
            </a>
          </div>

          {/* Telegram Submission Card */}
          <div className="bg-[#1C2951] text-white p-6 rounded-2xl text-left space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs text-amber-400 font-black uppercase tracking-wider">Telegram Submission</span>
              <span className="text-xs font-bold text-white/80">@Yenegeevent</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Final info has been prepared for the telegram account of <strong className="text-amber-300">@Yenegeevent</strong>. Click below to open Telegram and send your registration details directly.
            </p>
            <a 
              href={tgUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              <span>✈️ Open &amp; Send to Telegram @Yenegeevent</span>
            </a>
          </div>

          <div className="pt-2 flex justify-center gap-4">
            <Link
              to="/masterclass"
              className="group relative inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-3.5 rounded-full font-black text-xs hover:scale-105 transition-all shadow-xl"
            >
              <span className="tracking-widest uppercase">Back to Program</span>
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-luxury min-h-screen text-white pb-20 font-sans selection:bg-[#FFD447] selection:text-[#1C2951]">
      <style>{sharedStyles}</style>

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#0F172A]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/masterclass" className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10" title="Back to Masterclass">
            <FiArrowLeft className="text-white" />
          </Link>
          <span className="font-bold tracking-tight text-white text-sm sm:text-base">YENEGE ACADEMY</span>
        </div>
        <button 
          onClick={toggleLanguage}
          className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white transition-all active:scale-95"
          title="Change Language"
        >
          <span className={language === 'am' ? 'text-[#FFD447] font-black' : 'text-white/60'}>አማ</span>
          <div className="w-px h-2 bg-white/30" />
          <span className={language === 'en' ? 'text-[#FFD447] font-black' : 'text-white/60'}>EN</span>
          <div className="w-px h-2 bg-white/30" />
          <span className={language === 'om' ? 'text-[#FFD447] font-black' : 'text-white/60'}>OM</span>
        </button>
      </nav>

      {/* Header section */}
      <div className="pt-24 sm:pt-28 pb-4 px-4 sm:px-6 text-center max-w-3xl mx-auto">
        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl mb-3 tracking-tighter text-white leading-tight">
          {language === 'am' ? 'የኢቨንት ዘርፍ መመዝገቢያ' : language === 'om' ? 'Uunka Galmee Qophii' : 'Event Industry Interest &'} <span className="italic text-gold-gradient">{language === 'am' ? 'ቅጽ' : language === 'om' ? 'Leenjii' : 'Registration'}</span>
        </h1>
        <p className="text-[#FFD447]/80 text-[10px] font-black uppercase tracking-[0.25em]">
          {language === 'am' ? 'የተረጋገጠ የኢቨንት አርክቴክቸር ባለሙያ ይሁኑ' : language === 'om' ? 'Ogeessa Ijaarsa Qophii Beekamtii Qabu Ta\'aa' : 'Become a Certified Experience Architect'}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Step Progress Line */}
        <div className="mb-8 max-w-xl mx-auto px-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/10 -translate-y-1/2 z-0" />
            <div 
              className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] -translate-y-1/2 z-0 transition-all duration-500" 
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />
            {[1, 2, 3, 4, 5].map((step) => {
              const isCompleted = currentStep > step;
              const isActive = currentStep === step;
              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <button 
                    type="button"
                    onClick={() => {
                      if (step < currentStep) {
                        setCurrentStep(step);
                      } else if (step > currentStep && validateStep(currentStep)) {
                        let ok = true;
                        for (let s = currentStep; s < step; s++) {
                          if (!validateStep(s)) {
                            ok = false;
                            break;
                          }
                        }
                        if (ok) setCurrentStep(step);
                      }
                    }}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-extrabold text-xs transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-[#FFD447] text-[#1C2951] shadow-lg shadow-[#FFD447]/20' 
                        : isActive 
                          ? 'bg-[#1C2951] text-white ring-4 ring-[#FFD447]/30 border-2 border-[#FFD447] scale-110 shadow-lg shadow-[#FFD447]/10' 
                          : 'bg-[#1E293B] text-slate-400 border border-white/10'
                    }`}
                  >
                    {isCompleted ? <FiCheck className="stroke-[3px]" /> : step}
                  </button>
                  <span className={`absolute top-10 text-[8px] uppercase tracking-widest font-black whitespace-nowrap hidden sm:block ${isActive ? 'text-[#FFD447] font-extrabold' : 'text-slate-400 font-semibold'}`}>
                    {stepLabels[step - 1]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile Active Step Label Badge */}
          <div className="sm:hidden text-center mt-3">
            <span className="px-3.5 py-1 rounded-full bg-[#FFD447]/10 text-[#FFD447] border border-[#FFD447]/30 text-[10px] font-black uppercase tracking-widest inline-block">
              Step {currentStep} of 5 — {stepLabels[currentStep - 1]}
            </span>
          </div>
        </div>

        {/* Form Wizard Container */}
        <div className="bg-[#1E293B]/70 backdrop-blur-xl p-5 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/50 relative">
          
          {submissionError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold font-sans">
              {submissionError}
            </div>
          )}

          {/* STEP 1: Personal Profile */}
          {currentStep === 1 && (
            <div className="animate-step space-y-6">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-white mb-1 font-bold">
                  {language === 'am' ? 'ስለ እርስዎ' : language === 'om' ? 'Waa\'ee keessan' : 'Tell us about'} <span className="italic text-gold-gradient">{language === 'am' ? 'ይንገሩን' : language === 'om' ? 'nuus etaa' : 'yourself'}</span>
                </h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-6">
                  {language === 'am' ? 'ደረጃ 1 ከ 5፡ የግል መረጃ' : language === 'om' ? 'Sadarkaa 1 keessaa 5: Odeeffannoo Dhuunfaa' : 'Step 1 of 5: Personal Profile'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>{language === 'am' ? 'ሙሉ ስም' : language === 'om' ? 'Maqaa Guutuu' : 'Full Name'}</label>
                <div className="relative flex items-center">
                  <FiUser className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input 
                    required 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className={inputClasses} 
                    placeholder={language === 'am' ? 'ስምዎን እዚህ ያስገቡ' : language === 'om' ? 'Maqaa keessan guutuu galchaa' : 'Enter your full name'} 
                  />
                </div>
                {stepErrors.name && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>{language === 'am' ? 'ኢሜይል አድራሻ' : language === 'om' ? 'Teessoo Imeelii' : 'Email Address (Required for Verification & Receipt)'}</label>
                <div className="relative flex items-center">
                  <FiSend className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className={inputClasses} 
                    placeholder="your@email.com" 
                  />
                </div>
                {stepErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.email}</p>}
                {formData.email && !stepErrors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                  <p className="text-[10px] text-emerald-400 font-bold mt-1 ml-1 flex items-center gap-1">
                    ✓ {language === 'am' ? 'ኢሜይል አድራሻው ተረጋግጧል' : language === 'om' ? 'Teessoon imeelii mirkanaa\'eera' : 'Email verified for instant registration confirmation receipt'}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>{language === 'am' ? 'ስልክ ቁጥር' : language === 'om' ? 'Lakk. Bilbilaa' : 'Phone Number'}</label>
                <div className="relative flex items-center">
                  <FiPhone className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input 
                    required 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className={inputClasses} 
                    placeholder="09..." 
                  />
                </div>
                {stepErrors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.phone}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClasses}>{language === 'am' ? 'ዕድሜ' : language === 'om' ? 'Umurii' : 'Age'}</label>
                  <input 
                    required 
                    type="number" 
                    name="age" 
                    value={formData.age} 
                    onChange={handleChange} 
                    className="w-full bg-[#1E293B]/80 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-[#FFD447] focus:bg-[#1E293B] focus:ring-[4px] focus:ring-[#FFD447]/10 outline-none transition-all placeholder:text-slate-400 font-sans shadow-inner hover:border-white/20 duration-300 text-sm"
                    placeholder="e.g. 21" 
                  />
                  {stepErrors.age && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.age}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className={labelClasses}>{language === 'am' ? 'ጾታ' : language === 'om' ? 'Kornyaa' : 'Sex'}</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {['male', 'female'].map((s) => {
                      const isSelected = formData.sex === s;
                      const sexLabel = s === 'male' 
                        ? (language === 'am' ? 'ወንድ' : language === 'om' ? 'Dhiira' : 'Male')
                        : (language === 'am' ? 'ሴት' : language === 'om' ? 'Dubara' : 'Female');
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, sex: s }));
                            if (stepErrors.sex) {
                              setStepErrors(prev => {
                                const next = { ...prev };
                                delete next.sex;
                                return next;
                              });
                            }
                          }}
                          className={`py-3.5 rounded-2xl border text-center font-bold text-xs uppercase tracking-wider transition-all ${
                            isSelected
                              ? 'border-[#FFD447] bg-[#FFD447]/10 text-white ring-[3px] ring-[#FFD447]/10 font-black'
                              : 'border-white/10 bg-[#1E293B]/60 hover:bg-[#1E293B] text-slate-300'
                          }`}
                        >
                          {sexLabel}
                        </button>
                      );
                    })}
                  </div>
                  {stepErrors.sex && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.sex}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>{language === 'am' ? 'የሚኖሩበት ክልል/ከተማ' : language === 'om' ? 'Naannoo/Magaalaa' : 'Place in Ethiopia (Region/Area)'}</label>
                <div className="relative flex items-center">
                  <FiMapPin className="absolute left-4 text-slate-400 pointer-events-none z-10" />
                  <select 
                    required 
                    name="place" 
                    value={formData.place} 
                    onChange={handleChange} 
                    className={selectClasses}
                  >
                    <option value="">{language === 'am' ? 'ክልል ይምረጡ' : language === 'om' ? 'Naannoo Filadhaa' : 'Select Region'}</option>
                    <option value="Addis Ababa">Addis Ababa / አዲስ አበባ</option>
                    <option value="Afar">Afar / ዓፋር</option>
                    <option value="Amhara">Amhara / አማራ</option>
                    <option value="Benishangul-Gumuz">Benishangul-Gumuz / ቤኒሻንጉል ጉሙዝ</option>
                    <option value="Central Ethiopia">Central Ethiopia / ማዕከላዊ ኢትዮጵያ</option>
                    <option value="Dire Dawa">Dire Dawa / ድሬዳዋ</option>
                    <option value="Gambela">Gambela / ጋምቤላ</option>
                    <option value="Harari">Harari / ሐረሪ</option>
                    <option value="Oromia">Oromia / ኦሮሚያ</option>
                    <option value="Sidama">Sidama / ሲዳማ</option>
                    <option value="Somali">Somali / ሶማሌ</option>
                    <option value="South Ethiopia">South Ethiopia / ደቡብ ኢትዮጵያ</option>
                    <option value="South West Ethiopia">South West Ethiopia / ደቡብ ምዕራብ ኢትዮጵያ</option>
                    <option value="Tigray">Tigray / ትግራይ</option>
                  </select>
                  <FiChevronDown className="absolute right-4 text-slate-400 pointer-events-none z-10" />
                </div>
                {stepErrors.place && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.place}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: Background & Schedule */}
          {currentStep === 2 && (
            <div className="animate-step space-y-8">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-white mb-1 font-bold">
                  {language === 'am' ? 'የስልጠና መርሃ-ግብር እና' : language === 'om' ? 'Sagantaa fi Mala Leenjii' : 'Select program schedule &'} <span className="italic text-gold-gradient">{language === 'am' ? 'ሁኔታ ይምረጡ' : language === 'om' ? 'Filadhaa' : 'format'}</span>
                </h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-6">
                  {language === 'am' ? 'ደረጃ 2 ከ 5፡ የስልጠና ሁኔታ' : language === 'om' ? 'Sadarkaa 2 keessaa 5: Mala Leenjii' : 'Step 2 of 5: Delivery & Timing'}
                </p>
              </div>

              {/* Q5: What best describes you? */}
              <div className="space-y-3">
                <label className={labelClasses}>
                  5. {language === 'am' ? 'እርስዎን በይበልጥ የሚገልጸው የትኛው ነው?' : language === 'om' ? 'Isin kan ibsu kamidha?' : 'What best describes you?'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'High school student', am: 'የ2ኛ ደረጃ ተማሪ', om: 'Barataa Mana Barumsaa', icon: '🎓' },
                    { label: 'University/college student', am: 'የዩኒቨርሲቲ/ኮሌጅ ተማሪ', om: 'Barataa Yuunivarsiitii/Koleejjii', icon: '🏛️' },
                    { label: 'Recent graduate', am: 'አዲስ ተመረቂ', om: 'Eebifamaa Haarawaa', icon: '📜' },
                    { label: 'Working professional', am: 'ተቀጣሪ ሰራተኛ', om: 'Hojjetaa', icon: '💼' },
                    { label: 'Entrepreneur/business owner', am: 'የግል ስራ ባለቤት', om: 'Abbaa Daldalaa', icon: '🚀' },
                    { label: 'Freelancer', am: 'ፍሪላንሰር', om: 'Hojjetaa Dhuunfaa', icon: '💻' },
                    { label: 'Looking for work', am: 'ስራ ፈላጊ', om: 'Hojii Barbaadaa', icon: '🔍' },
                    { label: 'Other', am: 'ሌላ', om: 'Kan biraa', icon: '✨' }
                  ].map(({ label, am, om, icon }) => {
                    const isSelected = formData.describe_you === label;
                    const displayLabel = language === 'am' ? am : language === 'om' ? om : label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, describe_you: label }));
                          if (stepErrors.describe_you) {
                            setStepErrors(prev => {
                              const next = { ...prev };
                              delete next.describe_you;
                              return next;
                            });
                          }
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 ${
                          isSelected
                            ? 'border-[#FFD447] bg-[#FFD447]/10 text-white ring-[4px] ring-[#FFD447]/10 font-bold shadow-md'
                            : 'border-white/10 bg-[#1E293B]/60 hover:bg-[#1E293B] text-slate-300'
                        }`}
                      >
                        <span className="text-xl">{icon}</span>
                        <span className="text-xs font-semibold">{displayLabel}</span>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.describe_you && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.describe_you}</p>}
              </div>

              {/* Q6: Start Date Schedule Option */}
              <div className="space-y-3">
                <label className={labelClasses}>
                  6. {t.masterclassPage.question6Label || (language === 'am' ? 'የትኛውን የስልጠና ክፍለ-ጊዜ መጀመር ይመርጣሉ?' : language === 'om' ? 'Yeroo leenjii kam filattu?' : 'Which date and time would you prefer to start?')}
                </label>
                <div className="space-y-3">
                  {scheduleOptions.map(({ id, val, label, time, date }) => {
                    const isSelected = formData.preferred_schedule === val;
                    const eth = date ? toEthiopianDate(date) : null;
                    return (
                      <button
                        key={id || val}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, preferred_schedule: val }));
                          if (stepErrors.preferred_schedule) {
                            setStepErrors(prev => {
                              const next = { ...prev };
                              delete next.preferred_schedule;
                              return next;
                            });
                          }
                        }}
                        className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between ${
                          isSelected
                            ? 'border-[#FFD447] bg-[#FFD447]/10 ring-[4px] ring-[#FFD447]/10 shadow-md'
                            : 'border-white/10 bg-[#1E293B]/60 hover:bg-[#1E293B]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-extrabold text-white">{label}</p>
                            {eth && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFD447]/20 text-[#FFD447] font-black text-[10px] border border-[#FFD447]/30">
                                🇪🇹 {eth.formattedAmharic} ({eth.formattedEnglish})
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">{time}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-[#FFD447] border-[#FFD447] text-[#1C2951]' : 'border-white/20'
                        }`}>
                          {isSelected && <FiCheck size={12} className="stroke-[3px]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.preferred_schedule && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.preferred_schedule}</p>}
              </div>

              {/* Q7: Learning Mode Choice */}
              <div className="space-y-3">
                <label className={labelClasses}>
                  7. {language === 'am' ? 'ስልጠናውን በምን መንገድ መውሰድ ይፈልጋሉ?' : language === 'om' ? 'Leenjii akkamitti fudhachuu barbaadu?' : 'How would you prefer to learn?'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { mode: 'In-person', amMode: 'በአካል', omMode: 'Qaamaan', price: '15,000 ETB', desc: language === 'am' ? 'በቀጥታ በአካል የሚሰጥ ስልጠና' : language === 'om' ? 'Leenjii qaamaan berbaadamu' : 'Face-to-face immersive workshops' },
                    { mode: 'Full Online', amMode: 'ኦንላይን', omMode: 'Intarneetiin', price: '7,000 ETB', desc: language === 'am' ? 'በዲጂታል አማራጭ በቪዲዮ' : language === 'om' ? 'Leenjii intarneetiin kennamu' : 'Remote digital curriculum' },
                    { mode: 'Hybrid', amMode: 'ሃይብሪድ', omMode: 'Makuu', price: '10,000 ETB', desc: language === 'am' ? 'የተቀላቀለ በአካል እና ኦንላይን' : language === 'om' ? 'Makuu intarneetii fi qaamaan' : 'Mixed offline & online delivery' },
                  ].map(({ mode, amMode, omMode, price, desc }) => {
                    const isSelected = formData.learning_mode === `${mode} — ${price}`;
                    const displayMode = language === 'am' ? amMode : language === 'om' ? omMode : mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, learning_mode: `${mode} — ${price}` }));
                          if (stepErrors.learning_mode) {
                            setStepErrors(prev => {
                              const next = { ...prev };
                              delete next.learning_mode;
                              return next;
                            });
                          }
                        }}
                        className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between min-h-[96px] ${
                          isSelected 
                            ? 'border-[#FFD447] bg-[#FFD447]/10 ring-[4px] ring-[#FFD447]/10 shadow-md' 
                            : 'border-white/10 bg-[#1E293B]/60 hover:bg-[#1E293B]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-[#FFD447]' : 'text-slate-400'}`}>
                            {displayMode}
                          </span>
                          {isSelected && <FiCheckCircle className="text-[#FFD447]" />}
                        </div>
                        <div>
                          <p className="text-lg md:text-xl font-extrabold text-white leading-none mb-1">{price}</p>
                          <p className="text-[9px] md:text-[10px] text-slate-400 leading-tight font-medium">{desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.learning_mode && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.learning_mode}</p>}
              </div>
            </div>
          )}

          {/* STEP 3: Interests & Opportunities */}
          {currentStep === 3 && (
            <div className="animate-step space-y-8">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-white mb-1 font-bold">
                  {language === 'am' ? 'የኢቨንት ዘርፍ' : language === 'om' ? 'Gosa Qophii fi' : 'Select your event'} <span className="italic text-gold-gradient">{language === 'am' ? 'ፍላጎቶችዎን ይምረጡ' : language === 'om' ? 'Fedhii Filadhaa' : 'interests & opportunities'}</span>
                </h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-6">
                  {language === 'am' ? 'ደረጃ 3 ከ 5፡ ፍላጎቶች' : language === 'om' ? 'Sadarkaa 3 keessaa 5: Fedhii' : 'Step 3 of 5: Interests & Aspirations'}
                </p>
              </div>

              {/* Q8: What types of events would you most like to work on? */}
              <div className="space-y-3">
                <label className={labelClasses}>
                  8. {language === 'am' ? 'በየትኞቹ የኢቨንት አይነቶች መስራት ይመርጣሉ?' : language === 'om' ? 'Qophiiwwan kam irratti hojjechuu barbaadu?' : 'What types of events would you most like to work on?'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {[
                    { label: 'Corporate', am: 'የድርጅት', om: 'Daldalaa', icon: '💼' },
                    { label: 'Social', am: 'ማህበራዊ', om: 'Hawaasaa', icon: '🎉' },
                    { label: 'Exhibitions', am: 'ኤግዚቢሽን', om: 'Agarsiisa', icon: '🎪' },
                    { label: 'Cultural', am: 'ባህላዊ', om: 'Aadaa', icon: '🎭' },
                    { label: 'Public', am: 'ሕዝባዊ', om: 'Uummataa', icon: '🌍' }
                  ].map(({ label, am, om, icon }) => {
                    const isSelected = formData.event_types.includes(label);
                    const displayLabel = language === 'am' ? am : language === 'om' ? om : label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleEventType(label)}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'border-[#FFD447] bg-[#FFD447]/10 text-white ring-[3px] ring-[#FFD447]/10 font-extrabold shadow-md'
                            : 'border-white/10 bg-[#1E293B]/60 hover:bg-[#1E293B] text-slate-300 font-medium'
                        }`}
                      >
                        <span className="text-xl sm:text-2xl">{icon}</span>
                        <span className="text-[10px] sm:text-[11px] font-bold tracking-tight">{displayLabel}</span>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.event_types && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.event_types}</p>}
              </div>

              {/* Q9: WHAT KIND OF OPPORTUNITY DO YOU WANT? */}
              <div className="space-y-3">
                <label className={labelClasses}>
                  9. {language === 'am' ? 'ምን አይነት ዕድል ማግኘት ይፈልጋሉ?' : language === 'om' ? 'Carraa akkamii argachuu barbaadu?' : 'WHAT KIND OF OPPORTUNITY DO YOU WANT?'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { en: 'Learning event management', am: 'የኢቨንት አመራር መማር', om: 'Ogummaa leenji\'uu' },
                    { en: 'Getting practical experience', am: 'የተግባር ልምድ ማግኘት', om: 'Muxannoo dhugaa argachuu' },
                    { en: 'Internship opportunities', am: 'የልምድ ልምምድ (Internship) ዕድል', om: 'Carraa shaakala hojii' },
                    { en: 'Working with an event company', am: 'ከኢቨንት ድርጅቶች ጋር መስራት', om: 'Kampaanii qophii waliin hojjechuu' },
                    { en: 'Starting my own business', am: 'የግል ድርጅት መክፈት', om: 'Hojii dhuunfaa jalqabuu' },
                    { en: 'Freelancing', am: 'በፍሪላንስ መስራት', om: 'Hojii dhuunfaa (Freelance)' },
                    { en: 'Networking with event professionals', am: 'ከዘርፉ ባለሙያዎች ጋር መገናኘት', om: 'Ogeessota waliin wal-quunnamuu' },
                    { en: 'All of the above', am: 'ሁሉንም', om: 'Hunda isaanii' },
                    { en: "I'm not sure yet", am: 'ገና አልወሰንኩም', om: 'Ammatti hin murteessine' }
                  ].map(({ en, am, om }) => {
                    const isSelected = formData.opportunity_interest.includes(en);
                    const displayOpp = language === 'am' ? am : language === 'om' ? om : en;
                    return (
                      <button
                        key={en}
                        type="button"
                        onClick={() => toggleOpportunity(en)}
                        className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all duration-300 flex items-center justify-between ${
                          isSelected 
                            ? 'bg-[#FFD447]/10 text-white border-[#FFD447] shadow-md ring-[3px] ring-[#FFD447]/10' 
                            : 'bg-[#1E293B]/60 hover:bg-[#1E293B] border-white/10 text-slate-300'
                        }`}
                      >
                        <span className="font-semibold">{displayOpp}</span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-[#FFD447] border-[#FFD447] text-[#1C2951]' : 'border-white/20'
                        }`}>
                          {isSelected && <FiCheck size={12} className="stroke-[3px]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.opportunity_interest && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.opportunity_interest}</p>}
              </div>

              {/* Q10: Achieve in the event industry */}
              <div className="relative space-y-2">
                <label className={labelClasses}>
                  10. {language === 'am' ? 'በኢቨንት ዘርፉ ምን ማሳካት ይፈልጋሉ?' : language === 'om' ? 'Sektera qophii keessatti maal galmaan gahuu barbaadu?' : 'What would you like to learn or achieve in the event industry?'}
                </label>
                <textarea 
                  required
                  name="learning_goals" 
                  value={formData.learning_goals} 
                  onChange={handleChange}
                  placeholder={language === 'am' ? 'አላማዎን እና የሙያ እቅድዎን ያጋሩን...' : language === 'om' ? 'Kaayyoof fedhii keessan nuus etaa...' : 'Share your objectives and career expectations...'}
                  rows={4}
                  className="w-full bg-[#1E293B]/80 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-[#FFD447] focus:bg-[#1E293B] focus:ring-[6px] focus:ring-[#FFD447]/10 outline-none transition-all placeholder:text-slate-400 font-sans shadow-inner hover:border-white/20 duration-300 resize-none"
                />
                {stepErrors.learning_goals && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.learning_goals}</p>}
              </div>
            </div>
          )}

          {/* STEP 4: Marketing & Consent */}
          {currentStep === 4 && (
            <div className="animate-step space-y-8">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-white mb-1 font-bold">
                  {language === 'am' ? 'የመጨረሻ' : language === 'om' ? 'Gaaffiilee' : 'A few final'} <span className="italic text-gold-gradient">{language === 'am' ? 'ጥያቄዎች' : language === 'om' ? 'Dhumaa' : 'questions'}</span>
                </h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-6">
                  {language === 'am' ? 'ደረጃ 4 ከ 5፡ ስምምነት' : language === 'om' ? 'Sadarkaa 4 keessaa 5: Waliigaltee' : 'Step 4 of 5: Outreach & Preferences'}
                </p>
              </div>

              {/* Q11: How did you hear about Yenege Academy? */}
              <div className="space-y-3">
                <label className={labelClasses}>
                  11. {language === 'am' ? 'ስለ የነገ አካደሚ እንዴት ሰሙ?' : language === 'om' ? 'Akaadaamii Yenege akkamitti dhageessan?' : 'How did you hear about Yenege Academy?'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'TikTok', icon: '📱' },
                    { label: 'Instagram', icon: '📸' },
                    { label: 'Telegram', icon: '✈️' },
                    { label: 'Facebook', icon: '👥' },
                    { label: 'Friend/referral', am: 'ከጓደኛ', om: 'Hiriyyaa irraa', icon: '🤝' },
                    { label: 'Event/seminar', am: 'ከዝግጅት/ሴሚናር', om: 'Qophii irraa', icon: '🎤' },
                    { label: 'School/university', am: 'ከትምህርት ቤት', om: 'Mana Barumsaa irraa', icon: '🏛️' },
                    { label: 'Advertisement', am: 'ማስታወቂያ', om: 'Beeksisa', icon: '📢' },
                    { label: 'Google/search', am: 'ጎግል', om: 'Google', icon: '🔍' },
                    { label: 'Yenege staff', am: 'ከየነገ አባላት', om: 'Hojjetaa Yenege', icon: '👔' },
                    { label: 'Other', am: 'ሌላ', om: 'Kan biraa', icon: '✨' }
                  ].map(({ label, am, om, icon }) => {
                    const isSelected = formData.marketing_source === label;
                    const displaySrc = language === 'am' && am ? am : language === 'om' && om ? om : label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, marketing_source: label }));
                          if (stepErrors.marketing_source) {
                            setStepErrors(prev => {
                              const next = { ...prev };
                              delete next.marketing_source;
                              return next;
                            });
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex items-center gap-2 ${
                          isSelected
                            ? 'border-[#FFD447] bg-[#FFD447]/10 text-white ring-[4px] ring-[#FFD447]/10 font-extrabold shadow-md'
                            : 'border-white/10 bg-[#1E293B]/60 hover:bg-[#1E293B] text-slate-300'
                        }`}
                      >
                        <span className="text-base">{icon}</span>
                        <span className="text-xs font-semibold">{displaySrc}</span>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.marketing_source && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.marketing_source}</p>}
              </div>

              {/* Q12: Would you like our team to contact you? */}
              <div className="space-y-3">
                <label className={labelClasses}>
                  12. {language === 'am' ? 'ቡድናችን በስልክ ወይም በቴሌግራም እንዲያናግርዎት ይፈልጋሉ?' : language === 'om' ? 'Gareen keenya akka isin quunnamu barbaadu?' : 'Would you like our team to contact you about relevant programs and opportunities?'}
                </label>
                <div className="space-y-3">
                  {[
                    { label: "Yes, I'd like to be contacted", am: 'አዎ እንዲያናግሩኝ እፈልጋለሁ', om: 'Eeyyee akka nu quunnaman', desc: 'Our admissions agents will reach out' },
                    { label: "I'd like to receive information first", am: 'መረጃ መጀመሪያ ቢላክልኝ ይሻላል', om: 'Odeeffannoo dura naaf ergaa', desc: 'Send course outlines to my email/Telegram' },
                    { label: "Not right now", am: 'በአሁኑ ሰዓት አልፈልግም', om: 'Ammatti hin barbaadu', desc: 'Submit registration directly' }
                  ].map(({ label, am, om, desc }) => {
                    const isSelected = formData.contact_consent === label;
                    const displayConsent = language === 'am' ? am : language === 'om' ? om : label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, contact_consent: label }));
                          if (stepErrors.contact_consent) {
                            setStepErrors(prev => {
                              const next = { ...prev };
                              delete next.contact_consent;
                              return next;
                            });
                          }
                        }}
                        className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between ${
                          isSelected
                            ? 'border-[#FFD447] bg-[#FFD447]/10 ring-[4px] ring-[#FFD447]/10 shadow-md'
                            : 'border-white/10 bg-[#1E293B]/60 hover:bg-[#1E293B]'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-extrabold text-white">{displayConsent}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-[#FFD447] border-[#FFD447] text-[#1C2951]' : 'border-white/20'
                        }`}>
                          {isSelected && <FiCheck size={12} className="stroke-[3px]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.contact_consent && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.contact_consent}</p>}
              </div>

              {/* Guidelines checklist */}
              <div className="space-y-2">
                <label className="flex items-start gap-4 p-4 hover:bg-[#1E293B] rounded-2xl transition-all cursor-pointer border border-white/10 bg-[#1E293B]/40">
                  <input 
                    required 
                    type="checkbox" 
                    name="agreedToTerms" 
                    checked={formData.agreedToTerms} 
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }));
                      if (stepErrors.agreedToTerms) {
                        setStepErrors(prev => {
                          const next = { ...prev };
                          delete next.agreedToTerms;
                          return next;
                        });
                      }
                    }} 
                    className="mt-1 w-5 h-5 accent-[#FFD447] rounded border-white/20" 
                  />
                  <span className="text-xs text-slate-300 font-medium leading-relaxed">
                    {language === 'am' ? 'የስልጠና መመሪያዎችን እስማማለሁ፤ የኢቨንት አመራርን መማር እፈልጋለሁ።' : language === 'om' ? 'Qajeelfama leenjichaatiin walii gala; ogummaa qophii barachuu barbaada.' : 'I agree to the program guidelines and want to learn how to launch professional events.'}
                  </span>
                </label>
                {stepErrors.agreedToTerms && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.agreedToTerms}</p>}
              </div>
            </div>
          )}

          {/* STEP 5: Review & Confirm */}
          {currentStep === 5 && (
            <div className="animate-step space-y-8">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-white mb-1 font-bold">
                  {language === 'am' ? 'ምዝገባዎን ይመልከቱ እና' : language === 'om' ? 'Galmee keessan sakatta\'aa' : 'Review and'} <span className="italic text-gold-gradient">{language === 'am' ? 'ያረጋግጡ' : language === 'om' ? 'Mirkaneessaa' : 'confirm'}</span>
                </h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-6">
                  {language === 'am' ? 'ደረጃ 5 ከ 5፡ ማረጋገጫ' : language === 'om' ? 'Sadarkaa 5 keessaa 5: Mirkaneessa' : 'Step 5 of 5: Invoice & Submission'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#1E293B]/60 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-white/10">
                <ReviewField label={language === 'am' ? 'ሙሉ ስም' : language === 'om' ? 'Maqaa Guutuu' : 'Full Name'} value={formData.name} />
                <ReviewField label={language === 'am' ? 'ኢሜይል' : language === 'om' ? 'Imeelii' : 'Email Address'} value={formData.email || 'N/A'} />
                <ReviewField label={language === 'am' ? 'ስልክ' : language === 'om' ? 'Bilbila' : 'Phone Number'} value={formData.phone} />
                <div className="grid grid-cols-2 gap-4">
                  <ReviewField label={language === 'am' ? 'ዕድሜ' : language === 'om' ? 'Umurii' : 'Age'} value={formData.age} />
                  <ReviewField label={language === 'am' ? 'ጾታ' : language === 'om' ? 'Kornyaa' : 'Sex'} value={formData.sex} />
                </div>
                <ReviewField label={language === 'am' ? 'ቦታ/ክልል' : language === 'om' ? 'Naannoo' : 'Region/Place'} value={formData.place} />
                <ReviewField label={language === 'am' ? 'የስራ ሁኔታ' : language === 'om' ? 'Haala Hojii' : 'Status'} value={formData.describe_you} />
                <div className="md:col-span-2">
                  <ReviewField label={language === 'am' ? 'የተመረጠ ክፍለ-ጊዜ' : language === 'om' ? 'Yeroo Filatame' : 'Preferred Program Schedule'} value={formData.preferred_schedule} />
                </div>
                <div className="md:col-span-2">
                  <ReviewField label={language === 'am' ? 'የኢቨንት ዘርፎች' : language === 'om' ? 'Gosa Qophii' : 'Types of Events of Interest'} value={formData.event_types.join(', ')} />
                </div>
                <div className="md:col-span-2">
                  <ReviewField label={language === 'am' ? 'የሚፈለጉ ዕድሎች' : language === 'om' ? 'Carraawwan Barbaadaman' : 'Opportunities Desired'} value={formData.opportunity_interest.join(', ')} />
                </div>
                <div className="md:col-span-2">
                  <ReviewField label={language === 'am' ? 'አላማ እና እቅድ' : language === 'om' ? 'Kaayyoowwan' : 'Goals & Objectives'} value={formData.learning_goals} />
                </div>
              </div>

              {/* Dynamic Invoice / Tuition Breakdown Card */}
              <div className="bg-[#1C2951] text-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-white/10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD447]/10 rounded-full blur-3xl pointer-events-none" />
                
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD447] mb-4">
                  {language === 'am' ? 'የምዝገባ ክፍያ ማጠቃለያ' : language === 'om' ? 'Gudunfaa Kaffaltii Galmee' : 'Enrollment Summary Invoice'}
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-white/10 pb-3">
                    <span className="text-slate-300">{language === 'am' ? 'የስልጠና አይነት' : language === 'om' ? 'Gosa Leenjii' : 'Selected Format:'}</span>
                    <span className="font-bold">{formData.learning_mode.split(' — ')[0]}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-300">{language === 'am' ? 'የስልጠና ክፍያ' : language === 'om' ? 'Kaffaltii Leenjii' : 'Tuition Fee:'}</span>
                    <span className="font-extrabold">{calculateFee().toLocaleString()} ETB</span>
                  </div>

                  {referralCode && (
                    <div className="flex justify-between text-violet-300 font-bold bg-white/5 p-2.5 rounded-xl border border-white/5 mt-2">
                      <span className="flex items-center gap-1">🎟️ Referral Applied:</span>
                      <span>{referralCode}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-white/20 pt-4 text-lg font-black mt-4">
                    <span className="text-[#FFD447]">{language === 'am' ? 'ጠቅላላ ክፍያ' : language === 'om' ? "Ida'amama Kaffaltii" : 'Total Tuition due:'}</span>
                    <span className="text-[#FFD447]">{calculateFee().toLocaleString()} ETB</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-medium pt-2 border-t border-white/10 mt-3">
                    Payment instructions and options will be shared with you by our admissions team upon review. final info to the telegram account of <a href="https://t.me/Yenegeevent" target="_blank" rel="noopener noreferrer" className="text-[#FFD447] font-bold underline hover:text-white">@Yenegeevent</a>
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] text-[#1C2951] font-black flex items-center justify-center gap-3 text-xs sm:text-sm tracking-[0.2em] uppercase hover:-translate-y-1 active:scale-95 transition-all duration-300 shadow-2xl shadow-[#FF6F5E]/20 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <><FiLoader className="animate-spin text-[#1C2951]" /> {language === 'am' ? 'በማስገባት ላይ...' : language === 'om' ? 'Ergamaa jira...' : 'Submitting Reservation...'}</>
                ) : (
                  <><FiCheck className="stroke-[3px]" /> {language === 'am' ? 'ምዝገባውን አረጋግጥ' : language === 'om' ? 'Galmee Mirkaneessi' : 'Complete & Submit'}</>
                )}
              </button>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-white/10 pt-8 mt-10">
            {currentStep > 1 ? (
              <button 
                type="button" 
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-300 bg-white/5 hover:bg-white/10 transition-all border border-white/10"
              >
                <FiArrowLeft /> {language === 'am' ? 'ተመለስ' : language === 'om' ? 'Deebi\'aa' : 'Back'}
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button 
                type="button" 
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-[#1C2951] bg-[#FFD447] hover:bg-[#ffe073] hover:shadow-md transition-all ml-auto font-sans"
              >
                {language === 'am' ? 'ቀጣይ' : language === 'om' ? 'Itti Fufaa' : 'Next'} <FiArrowRight />
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-[9px] uppercase tracking-wider font-extrabold text-[#FFD447]">{label}</p>
    <p className="text-xs font-bold text-white break-words leading-relaxed">{value || 'N/A'}</p>
  </div>
);

export default MasterclassRegistration;

