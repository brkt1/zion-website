import React, { useEffect, useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiChevronDown, FiLoader, FiMapPin, FiPhone, FiSend, FiUser, FiBriefcase, FiBookOpen, FiInfo, FiCheck, FiArrowRight } from 'react-icons/fi';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { adminApi } from '../services/adminApi';
import { getActiveMasterclassSchedules, getActiveMasterclassSchedulesSync, MasterclassScheduleOption } from '../services/masterclassSchedules';
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
  // Seed from localStorage cache immediately (instant paint, no flicker)
  const [scheduleOptions, setScheduleOptions] = useState<MasterclassScheduleOption[]>(
    getActiveMasterclassSchedulesSync()
  );

  useEffect(() => {
    // Refresh from Supabase — this updates both state and the localStorage cache
    const fetchSchedules = async () => {
      const fresh = await getActiveMasterclassSchedules();
      setScheduleOptions(fresh);
    };
    fetchSchedules();
    window.addEventListener('masterclass_schedules_updated', fetchSchedules);
    return () => window.removeEventListener('masterclass_schedules_updated', fetchSchedules);
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

  const yenegeYellow = "#D4AF37";
  const coralOrange = "#D4AF37";
  const indigoDeep = "#000000";

  const inputClasses = "w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-12 pr-4 py-3.5 text-white focus:border-[#D4AF37]/80 focus:bg-white/[0.08] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all duration-300 placeholder:text-white/60 font-sans hover:border-white/20 hover:bg-white/[0.06] text-sm";
  const selectClasses = "w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-12 pr-10 py-3.5 text-white focus:border-[#D4AF37]/80 focus:bg-white/[0.08] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all duration-300 font-sans hover:border-white/20 appearance-none text-sm";
  const labelClasses = "block text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mb-2 font-sans";

  const stepLabels = language === 'am' 
    ? ["ግል መረጃ", "ሁኔታ", "ፍላጎቶች", "ስምምነት", "ማረጋገጫ"]
    : language === 'om'
      ? ["Odeeffannoo", "Mala", "Fedhii", "Waliigaltee", "Mirkaneessa"]
      : ["Profile", "Format", "Interests", "Consent", "Review"];

  const stepIcons = ["👤", "🎯", "✨", "🤝", "🚀"];

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;700;800;900&display=swap');
    .font-serif { font-family: 'Outfit', serif; }
    .font-sans  { font-family: 'Inter', sans-serif; }

    .reg-bg {
      background: #000000;
      min-height: 100vh;
      position: relative;
    }
    .reg-bg::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse 80% 60% at 20% -10%, rgba(255,212,71,0.14) 0%, transparent 55%),
        radial-gradient(ellipse 60% 50% at 80% 110%, rgba(255,111,94,0.12) 0%, transparent 55%),
        radial-gradient(ellipse 40% 40% at 50% 50%, rgba(123,92,255,0.07) 0%, transparent 60%);
      pointer-events: none;
      z-index: 0;
    }

    .text-gold-gradient {
      background: linear-gradient(135deg, #D4AF37 0%, #D4AF37 50%, #D4AF37 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .glow-button-amber {
      background: linear-gradient(135deg, #D4AF37 0%, #D4AF37 50%, #D4AF37 100%);
      color: #000000;
      font-weight: 900;
      box-shadow: 0 0 0 1px rgba(255,212,71,0.4), 0 8px 32px rgba(255,212,71,0.25), 0 2px 8px rgba(255,111,94,0.2);
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
      letter-spacing: 0.06em;
    }
    .glow-button-amber:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 0 1px rgba(255,212,71,0.6), 0 12px 40px rgba(255,212,71,0.35), 0 4px 16px rgba(255,111,94,0.3);
    }

    .glass-card {
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
    }

    .glass-card-gold {
      background: rgba(255,212,71,0.06);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,212,71,0.25);
      box-shadow: 0 0 30px rgba(255,212,71,0.08), inset 0 1px 0 rgba(255,212,71,0.15);
    }

    .choice-btn {
      position: relative;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    .choice-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,212,71,0.08), rgba(255,111,94,0.04));
      opacity: 0;
      transition: opacity 0.25s;
    }
    .choice-btn:hover::before { opacity: 1; }
    .choice-btn.selected::before { opacity: 1; }
    .choice-btn.selected {
      border-color: rgba(255,212,71,0.6) !important;
      box-shadow: 0 0 0 3px rgba(255,212,71,0.12), 0 4px 20px rgba(255,212,71,0.1);
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-step {
      animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes pulse-ring {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    .step-ring::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid #D4AF37;
      animation: pulse-ring 2s ease-out infinite;
    }

    .input-focus-line {
      position: absolute;
      bottom: 0; left: 0;
      height: 2px;
      width: 0%;
      background: linear-gradient(90deg, #D4AF37, #D4AF37);
      border-radius: 0 0 12px 12px;
      transition: width 0.3s ease;
    }
    .input-wrapper:focus-within .input-focus-line { width: 100%; }
    .input-wrapper:focus-within > svg { color: #D4AF37 !important; }

    .step-pill {
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
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
      <div className="bg-black min-h-screen text-white flex items-center justify-center p-6 font-sans">
        <style>{sharedStyles}</style>
        <div className="max-w-xl w-full bg-[#0A0A0A] border border-white/10 p-8 md:p-14 rounded-[3rem] text-center relative z-10 animate-step space-y-6">
          <div className="w-20 h-20 bg-[#D4AF37] text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-[#D4AF37]/30">
            <FiCheckCircle size={40} />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl italic tracking-tight text-white">Registration Received!</h2>
          <p className="text-white/60 leading-relaxed font-medium text-sm">
            Thank you for submitting your <span className="text-white font-bold">Event Industry Interest &amp; Registration Form</span>. Payment instructions and options will be shared with you by our admissions team upon review.
          </p>

          {/* Email Notification Dispatch Card */}
          <div className="bg-[#0A0A0A] text-white p-5 rounded-2xl text-left space-y-2.5 border border-white/10 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs text-[#D4AF37] font-black uppercase tracking-wider flex items-center gap-1.5">
                ✉️ Registration Confirmation Email Dispatched
              </span>
              <span className="text-[10px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded-md">Verified</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-medium">
              An official registration receipt and schedule details have been dispatched to <strong className="text-white underline">{formData.email}</strong>.
            </p>
            <a 
              href={`mailto:${formData.email}?subject=${encodeURIComponent(`Yenege Masterclass Registration Confirmation — ${formData.name}`)}&body=${encodeURIComponent(`Dear ${formData.name},\n\nThank you for registering for the Yenege Masterclass!\n\nRegistration Summary:\nName: ${formData.name}\nPhone: ${formData.phone}\nSchedule: ${formData.preferred_schedule}\nFormat: ${formData.learning_mode}\nTuition Fee: ${calculateFee().toLocaleString()} ETB\n\nAdmissions Team\nYenege Academy`)}`}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white hover:bg-white/90 text-black font-extrabold rounded-xl text-[11px] uppercase tracking-wider transition-all"
            >
              <span>📩 View Confirmation Email Receipt</span>
            </a>
          </div>

          {/* Telegram Submission Card */}
          <div className="bg-[#000000] text-white p-6 rounded-2xl text-left space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs text-[#D4AF37] font-black uppercase tracking-wider">Telegram Submission</span>
              <span className="text-xs font-bold text-white/80">@Yenegeevent</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Final info has been prepared for the telegram account of <strong className="text-white">@Yenegeevent</strong>. Click below to open Telegram and send your registration details directly.
            </p>
            <a 
              href={tgUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#D4AF37] hover:bg-[#F5BD42] text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              <span>✈️ Open &amp; Send to Telegram @Yenegeevent</span>
            </a>
          </div>

          <div className="pt-2 flex justify-center gap-4">
            <Link
              to="/masterclass"
              className="group relative inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white border border-white/15 px-8 py-3.5 rounded-full font-black text-xs hover:scale-105 transition-all shadow-xl"
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
    <div className="reg-bg text-white pb-28 font-sans selection:bg-[#D4AF37] selection:text-[#000000] relative z-0">
      <style>{sharedStyles}</style>

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 sm:px-6 py-3.5">
        <div className="glass-card rounded-2xl flex items-center gap-3 px-3 py-2 shadow-lg">
          <Link to="/masterclass" className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.07] hover:bg-white/15 text-white/80 hover:text-white transition-all border border-white/[0.08]" title="Back">
            <FiArrowLeft size={14} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#D4AF37] flex items-center justify-center">
              <span className="text-[8px] font-black text-[#000000]">Y</span>
            </div>
            <span className="font-black tracking-wider text-white/90 text-xs uppercase">Yenege Academy</span>
          </div>
        </div>
        <button 
          onClick={toggleLanguage}
          className="glass-card rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white/70 hover:text-white transition-all active:scale-95 shadow-lg"
        >
          <span className={language === 'am' ? 'text-[#D4AF37]' : ''}>አማ</span>
          <span className="text-white/20">·</span>
          <span className={language === 'en' ? 'text-[#D4AF37]' : ''}>EN</span>
          <span className="text-white/20">·</span>
          <span className={language === 'om' ? 'text-[#D4AF37]' : ''}>OM</span>
        </button>
      </nav>

      {/* Hero Header */}
      <div className="relative z-10 pt-24 sm:pt-28 pb-6 px-4 sm:px-6 text-center max-w-2xl mx-auto">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-[#D4AF37]/20 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
          <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em]">
            {language === 'am' ? 'ነፃ ምዝገባ · Yenege Masterclass' : language === 'om' ? 'Galmee Bilisaa · Yenege Masterclass' : 'Free Enrollment · Yenege Masterclass'}
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-black mb-3 leading-[1.1] tracking-tight">
          {language === 'am' ? (
            <><span className="text-white">የኢቨንት ዘርፍ </span><span className="text-gold-gradient">ምዝገባ ቅጽ</span></>
          ) : language === 'om' ? (
            <><span className="text-white">Uunka </span><span className="text-gold-gradient">Galmee Leenjii</span></>
          ) : (
            <><span className="text-white">Join the </span><span className="text-gold-gradient">Experience Architects</span></>
          )}
        </h1>
        <p className="text-slate-400 text-sm font-medium max-w-md mx-auto">
          {language === 'am' ? 'የተረጋገጠ የኢቨንት አርክቴክቸር ባለሙያ ይሁኑ' : language === 'om' ? 'Ogeessa Ijaarsa Qophii Beekamtii Qabu Ta\'aa' : 'A 5-minute form that puts you on the path to becoming a certified event professional in East Africa.'}
        </p>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">

        {/* Step Pills Tracker */}
        <div className="mb-6">
          {/* Desktop: horizontal pills */}
          <div className="hidden sm:flex items-center gap-1 glass-card rounded-2xl p-1.5">
            {[1, 2, 3, 4, 5].map((step) => {
              const isCompleted = currentStep > step;
              const isActive = currentStep === step;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => {
                    if (step < currentStep) setCurrentStep(step);
                  }}
                  className={`step-pill flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20'
                      : isActive
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#D4AF37] text-[#000000] font-black shadow-lg shadow-[#D4AF37]/20'
                        : 'text-white/60 hover:text-slate-300'
                  }`}
                >
                  {isCompleted ? <FiCheck size={12} strokeWidth={3} /> : <span className="text-sm">{stepIcons[step - 1]}</span>}
                  <span className="text-[10px] uppercase tracking-wider hidden md:block">{stepLabels[step - 1]}</span>
                </button>
              );
            })}
          </div>
          {/* Mobile: progress arc */}
          <div className="sm:hidden glass-card rounded-2xl p-3 flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg viewBox="0 0 40 40" className="w-10 h-10 -rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="url(#gold)" strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - (currentStep - 1) / 4)}`}
                  strokeLinecap="round" style={{transition: 'stroke-dashoffset 0.5s ease'}} />
                <defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#D4AF37"/><stop offset="100%" stopColor="#D4AF37"/></linearGradient></defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">{currentStep}/5</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Step {currentStep} of 5</p>
              <p className="text-sm font-black text-white">{stepIcons[currentStep - 1]} {stepLabels[currentStep - 1]}</p>
            </div>
            <div className="ml-auto text-xl">{stepIcons[currentStep - 1]}</div>
          </div>
        </div>

        {/* Form Wizard Container */}
        <div className="glass-card rounded-[2rem] p-5 sm:p-8 relative overflow-hidden" style={{boxShadow: '0 0 0 1px rgba(255,212,71,0.08), 0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(255,212,71,0.05)'}}>
          {/* Decorative gold corner accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#D4AF37]/8 via-[#D4AF37]/4 to-transparent rounded-[2rem] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#D4AF37]/6 to-transparent rounded-[2rem] pointer-events-none" />
          
          {submissionError && (
            <div className="mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
              <span className="text-base">⚠️</span> {submissionError}
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
                  <div className="input-wrapper relative flex items-center">
                    <input 
                      required 
                      type="number" 
                      name="age" 
                      value={formData.age} 
                      onChange={handleChange} 
                      className={`${inputClasses} pl-5`}
                      placeholder="e.g. 21" 
                    />
                    <div className="input-focus-line" />
                  </div>
                  {stepErrors.age && <p className="text-[10px] text-red-400 font-bold mt-1 ml-1 flex items-center gap-1"><span>⚠</span> {stepErrors.age}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className={labelClasses}>{language === 'am' ? 'ጾታ' : language === 'om' ? 'Kornyaa' : 'Gender'}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['male', 'female'].map((s) => {
                      const isSelected = formData.sex === s;
                      const sexLabel = s === 'male' 
                        ? (language === 'am' ? 'ወንድ' : language === 'om' ? 'Dhiira' : 'Male')
                        : (language === 'am' ? 'ሴት' : language === 'om' ? 'Dubara' : 'Female');
                      const sexIcon = s === 'male' ? '♂' : '♀';
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, sex: s }));
                            if (stepErrors.sex) setStepErrors(prev => { const next = { ...prev }; delete next.sex; return next; });
                          }}
                          className={`choice-btn py-3 rounded-2xl border text-center font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'selected bg-[#D4AF37]/10 text-[#D4AF37]'
                              : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20 text-slate-400'
                          }`}
                        >
                          <span className="text-base">{sexIcon}</span> {sexLabel}
                        </button>
                      );
                    })}
                  </div>
                  {stepErrors.sex && <p className="text-[10px] text-red-400 font-bold mt-1 ml-1 flex items-center gap-1"><span>⚠</span> {stepErrors.sex}</p>}
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
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white ring-[4px] ring-[#D4AF37]/10 font-bold shadow-md'
                            : 'border-white/10 bg-[#0A0A0A]/60 hover:bg-[#0A0A0A] text-slate-300'
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
                          setFormData(prev => ({
                            ...prev,
                            preferred_schedule: val,
                            // Clear learning mode so user picks it fresh for this session
                            learning_mode: prev.preferred_schedule !== val ? '' : prev.learning_mode,
                          }));
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
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 ring-[4px] ring-[#D4AF37]/10 shadow-md'
                            : 'border-white/10 bg-[#0A0A0A]/60 hover:bg-[#0A0A0A]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-extrabold text-white">{label}</p>
                            {eth && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D4AF37]/20 text-[#D4AF37] font-black text-[10px] border border-[#D4AF37]/30">
                                🇪🇹 {eth.formattedAmharic} ({eth.formattedEnglish})
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">{time}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-[#D4AF37] border-[#D4AF37] text-[#000000]' : 'border-white/20'
                        }`}>
                          {isSelected && <FiCheck size={12} className="stroke-[3px]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.preferred_schedule && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.preferred_schedule}</p>}
              </div>

              {/* Q7: Learning Mode Choice — only shown after Q6 is selected */}
              {formData.preferred_schedule ? (
                <div className="space-y-3">
                  <label className={labelClasses}>
                    7. {language === 'am' ? 'ስልጠናውን በምን መንገድ መውሰድ ይፈልጋሉ?' : language === 'om' ? 'Leenjii akkamitti fudhachuu barbaadu?' : 'How would you prefer to learn?'}
                  </label>
                  {(() => {
                    const selectedSchedObj = scheduleOptions.find(s => s.val === formData.preferred_schedule);
                    const modesToDisplay = (selectedSchedObj?.available_modes || [
                      { mode: 'In-person', amMode: 'በአካል', omMode: 'Qaamaan', price: '15,000 ETB', desc: language === 'am' ? 'በቀጥታ በአካል የሚሰጥ ስልጠና' : language === 'om' ? 'Leenjii qaamaan berbaadamu' : 'Face-to-face immersive workshops', enabled: true },
                      { mode: 'Full Online', amMode: 'ኦንላይን', omMode: 'Intarneetiin', price: '7,000 ETB', desc: language === 'am' ? 'በዲጂታል አማራጭ በቪዲዮ' : language === 'om' ? 'Leenjii intarneetiin kennamu' : 'Remote digital curriculum', enabled: true },
                      { mode: 'Hybrid', amMode: 'ሃይብሪድ', omMode: 'Makuu', price: '10,000 ETB', desc: language === 'am' ? 'የተቀላቀለ በአካል እና ኦንላይን' : language === 'om' ? 'Makuu intarneetii fi qaamaan' : 'Mixed offline & online delivery', enabled: true },
                    ]).filter(m => m.enabled !== false);

                    if (modesToDisplay.length === 0) {
                      return (
                        <p className="text-xs text-[#D4AF37] font-bold p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          {language === 'am'
                            ? 'ለዚህ ክፍል የተለየ የተዘጋጀ አማራጭ የለም።'
                            : 'No available learning packages configured for this session schedule.'}
                        </p>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {modesToDisplay.map(({ mode, amMode, omMode, price, desc }) => {
                          const isSelected = formData.learning_mode === `${mode} — ${price}`;
                          const displayMode = language === 'am' ? (amMode || mode) : language === 'om' ? (omMode || mode) : mode;
                          const displayDesc = desc || (
                            mode === 'In-person' 
                              ? (language === 'am' ? 'በቀጥታ በአካል የሚሰጥ ስልጠና' : language === 'om' ? 'Leenjii qaamaan berbaadamu' : 'Face-to-face immersive workshops')
                              : mode === 'Full Online'
                              ? (language === 'am' ? 'በዲጂታል አማራጭ በቪዲዮ' : language === 'om' ? 'Leenjii intarneetiin kennamu' : 'Remote digital curriculum')
                              : (language === 'am' ? 'የተቀላቀለ በአካል እና ኦንላይን' : language === 'om' ? 'Makuu intarneetii fi qaamaan' : 'Mixed offline & online delivery')
                          );

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
                                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 ring-[4px] ring-[#D4AF37]/10 shadow-md' 
                                  : 'border-white/10 bg-[#0A0A0A]/60 hover:bg-[#0A0A0A]'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-[#D4AF37]' : 'text-slate-400'}`}>
                                  {displayMode}
                                </span>
                                {isSelected && <FiCheckCircle className="text-[#D4AF37]" />}
                              </div>
                              <div>
                                <p className="text-lg md:text-xl font-extrabold text-white leading-none mb-1">{price}</p>
                                <p className="text-[9px] md:text-[10px] text-slate-400 leading-tight font-medium">{displayDesc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                  {stepErrors.learning_mode && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.learning_mode}</p>}
                </div>
              ) : (
                /* Locked placeholder — user must pick Q6 first */
                <div className="flex items-start gap-3 p-4 rounded-2xl border border-white/8 bg-white/[0.02]">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiInfo className="text-white/60" size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-300 mb-0.5">
                      {language === 'am'
                        ? '7. ስልጠናውን በምን መንገድ መውሰድ ይፈልጋሉ?'
                        : language === 'om'
                        ? '7. Leenjii akkamitti fudhachuu barbaadu?'
                        : '7. How would you prefer to learn?'}
                    </p>
                    <p className="text-[11px] text-white/60">
                      {language === 'am'
                        ? 'ይህን ጥያቄ ለመመለስ መጀመሪያ ከላይ ያለውን የስልጠና ጊዜ (#6) ይምረጡ።'
                        : language === 'om'
                        ? 'Gaaffii kana deebisuuf, dursa sagantaa leenjii (#6) filadhu.'
                        : 'Please select a session schedule above (Q6) first — available formats depend on the session.'}
                    </p>
                  </div>
                </div>
              )}
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
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white ring-[3px] ring-[#D4AF37]/10 font-extrabold shadow-md'
                            : 'border-white/10 bg-[#0A0A0A]/60 hover:bg-[#0A0A0A] text-slate-300 font-medium'
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
                            ? 'bg-[#D4AF37]/10 text-white border-[#D4AF37] shadow-md ring-[3px] ring-[#D4AF37]/10' 
                            : 'bg-[#0A0A0A]/60 hover:bg-[#0A0A0A] border-white/10 text-slate-300'
                        }`}
                      >
                        <span className="font-semibold">{displayOpp}</span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-[#D4AF37] border-[#D4AF37] text-[#000000]' : 'border-white/20'
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
                  className="w-full bg-[#0A0A0A]/80 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-[#D4AF37] focus:bg-[#0A0A0A] focus:ring-[6px] focus:ring-[#D4AF37]/10 outline-none transition-all placeholder:text-slate-400 font-sans shadow-inner hover:border-white/20 duration-300 resize-none"
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
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white ring-[4px] ring-[#D4AF37]/10 font-extrabold shadow-md'
                            : 'border-white/10 bg-[#0A0A0A]/60 hover:bg-[#0A0A0A] text-slate-300'
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
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 ring-[4px] ring-[#D4AF37]/10 shadow-md'
                            : 'border-white/10 bg-[#0A0A0A]/60 hover:bg-[#0A0A0A]'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-extrabold text-white">{displayConsent}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-[#D4AF37] border-[#D4AF37] text-[#000000]' : 'border-white/20'
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
                <label className="flex items-start gap-4 p-4 hover:bg-[#0A0A0A] rounded-2xl transition-all cursor-pointer border border-white/10 bg-[#0A0A0A]/40">
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
                    className="mt-1 w-5 h-5 accent-[#D4AF37] rounded border-white/20" 
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0A0A0A]/60 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-white/10">
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
              <div className="bg-[#000000] text-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-white/10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
                
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-4">
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
                    <span className="text-[#D4AF37]">{language === 'am' ? 'ጠቅላላ ክፍያ' : language === 'om' ? "Ida'amama Kaffaltii" : 'Total Tuition due:'}</span>
                    <span className="text-[#D4AF37]">{calculateFee().toLocaleString()} ETB</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-medium pt-2 border-t border-white/10 mt-3">
                    Payment instructions and options will be shared with you by our admissions team upon review. final info to the telegram account of <a href="https://t.me/Yenegeevent" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] font-bold underline hover:text-white">@Yenegeevent</a>
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-[#D4AF37] to-[#D4AF37] text-[#000000] font-black flex items-center justify-center gap-3 text-xs sm:text-sm tracking-[0.2em] uppercase hover:-translate-y-1 active:scale-95 transition-all duration-300 shadow-2xl shadow-[#D4AF37]/20 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <><FiLoader className="animate-spin text-[#000000]" /> {language === 'am' ? 'በማስገባት ላይ...' : language === 'om' ? 'Ergamaa jira...' : 'Submitting Reservation...'}</>
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
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-[#000000] bg-[#D4AF37] hover:bg-[#ffe073] hover:shadow-md transition-all ml-auto font-sans"
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
    <p className="text-[9px] uppercase tracking-wider font-extrabold text-[#D4AF37]">{label}</p>
    <p className="text-xs font-bold text-white break-words leading-relaxed">{value || 'N/A'}</p>
  </div>
);

export default MasterclassRegistration;

