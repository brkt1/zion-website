import React, { useEffect, useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiChevronDown, FiLoader, FiMapPin, FiPhone, FiSend, FiUser, FiBriefcase, FiBookOpen, FiInfo, FiCheck, FiArrowRight } from 'react-icons/fi';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi } from '../services/adminApi';

const MasterclassRegistration: React.FC = () => {
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
    if (formData.learning_mode.includes('Online')) return 5000;
    if (formData.learning_mode.includes('Hybrid')) return 10000;
    return 0;
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

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

  const inputClasses = "w-full bg-white/70 border border-slate-200 rounded-2xl px-12 py-4 text-slate-900 focus:border-amber-500/50 focus:bg-white focus:ring-[6px] focus:ring-amber-500/5 outline-none transition-all placeholder:text-slate-300 font-sans shadow-sm hover:border-slate-300 duration-300";
  const selectClasses = "w-full bg-white/70 border border-slate-200 rounded-2xl px-12 py-4 text-slate-900 focus:border-amber-500/50 focus:bg-white focus:ring-[6px] focus:ring-amber-500/5 outline-none transition-all font-sans shadow-sm hover:border-slate-300 duration-300 appearance-none";
  const labelClasses = "block text-[10px] uppercase tracking-[0.4em] font-black text-slate-400 mb-2 ml-1 font-sans";

  const stepLabels = ["Profile", "Delivery", "Interests", "Consent", "Review"];

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Manrope:wght@300;400;600;800&display=swap');
    .font-serif { font-family: 'Playfair Display', serif; }
    .font-sans  { font-family: 'Manrope', sans-serif; }
    .glass-vivid-light {
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,1);
      box-shadow: 0 40px 100px -20px rgba(0,0,0,0.06);
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
      background: radial-gradient(circle at top right, rgba(255,212,71,0.06) 0%, transparent 40%),
                  radial-gradient(circle at bottom left, rgba(255,111,94,0.04) 0%, transparent 40%),
                  #FAF9F6;
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
    return (
      <div className="bg-luxury min-h-screen text-slate-900 flex items-center justify-center p-6 font-sans">
        <style>{sharedStyles}</style>
        <div className="max-w-xl w-full glass-vivid-light p-10 md:p-16 rounded-[3rem] text-center relative z-10 animate-step">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/20">
            <FiCheckCircle size={40} />
          </div>
          <h2 className="font-serif text-4xl mb-6 italic tracking-tight text-slate-900 text-gold-gradient">Registration Received!</h2>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">
            Thank you for submitting your <span className="text-slate-900 font-bold">Event Industry Interest &amp; Registration Form</span> to Yenege Academy. Our admissions team will review your profile and contact you shortly.
          </p>
          <Link
            to="/masterclass"
            className="group relative inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-full font-black hover:scale-105 transition-all shadow-xl overflow-hidden"
          >
            <span className="relative z-10 tracking-widest text-[10px] uppercase">Back to Program</span>
            <FiArrowLeft className="relative z-10 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-luxury min-h-screen text-slate-900 pb-20 font-sans selection:bg-amber-100 selection:text-amber-900">
      <style>{sharedStyles}</style>

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-4 flex items-center gap-4">
        <Link to="/masterclass" className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-100">
          <FiArrowLeft className="text-slate-600" />
        </Link>
        <span className="font-bold tracking-tight text-slate-800">YENEGE ACADEMY</span>
      </nav>

      {/* Header section */}
      <div className="pt-32 pb-6 px-6 text-center max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl mb-4 tracking-tighter text-slate-900 leading-tight">
          Event Industry Interest &amp; <span className="italic text-gold-gradient">Registration</span>
        </h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Become a Certified Experience Architect</p>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        
        {/* Step Progress Line */}
        <div className="mb-12 max-w-xl mx-auto px-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
            <div 
              className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 -translate-y-1/2 z-0 transition-all duration-500" 
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
                      // Allow going back to any step, or forward to a step if the current step is validated
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
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-amber-400 text-[#1C2951] shadow-lg shadow-amber-400/20' 
                        : isActive 
                          ? 'bg-[#1C2951] text-white ring-4 ring-amber-400/30 border-2 border-amber-400 scale-110 shadow-lg shadow-amber-400/10' 
                          : 'bg-white text-slate-300 border border-slate-100'
                    }`}
                  >
                    {isCompleted ? <FiCheck className="stroke-[3px]" /> : step}
                  </button>
                  <span className={`absolute top-11 text-[8px] uppercase tracking-widest font-black whitespace-nowrap hidden sm:block ${isActive ? 'text-slate-900 font-extrabold' : 'text-slate-400/70 font-semibold'}`}>
                    {stepLabels[step - 1]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Wizard Container */}
        <div className="bg-white/90 backdrop-blur-md p-5 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/40 relative">
          
          {submissionError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold font-sans">
              {submissionError}
            </div>
          )}

          {/* STEP 1: Personal Profile */}
          {currentStep === 1 && (
            <div className="animate-step space-y-6">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-slate-900 mb-1">Tell us about <span className="italic text-gold-gradient">yourself</span></h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-6">Step 1 of 5: Personal Profile</p>
              </div>

              <div className="relative">
                <label className={labelClasses}>Full Name</label>
                <input 
                  required 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className={inputClasses} 
                  placeholder="Enter your full name" 
                />
                <FiUser className="absolute left-5 top-[2.75rem] text-slate-400" />
                {stepErrors.name && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{stepErrors.name}</p>}
              </div>

              <div className="relative">
                <label className={labelClasses}>Email Address (Optional)</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className={inputClasses} 
                  placeholder="your@email.com" 
                />
                <FiSend className="absolute left-5 top-[2.75rem] text-slate-400" />
              </div>

              <div className="relative">
                <label className={labelClasses}>Phone Number</label>
                <input 
                  required 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className={inputClasses} 
                  placeholder="+251 ..." 
                />
                <FiPhone className="absolute left-5 top-[2.75rem] text-slate-400" />
                {stepErrors.phone && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{stepErrors.phone}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Age</label>
                  <input 
                    required 
                    type="number" 
                    name="age" 
                    value={formData.age} 
                    onChange={handleChange} 
                    className="w-full bg-white/70 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:border-amber-500/50 focus:bg-white focus:ring-[6px] focus:ring-amber-500/5 outline-none transition-all placeholder:text-slate-300 font-sans shadow-sm hover:border-slate-300 duration-300"
                    placeholder="e.g. 21" 
                  />
                  {stepErrors.age && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{stepErrors.age}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Sex</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['male', 'female'].map((s) => {
                      const isSelected = formData.sex === s;
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
                          className={`py-4 rounded-2xl border text-center font-bold text-xs uppercase tracking-widest transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/5 text-slate-800 ring-[4px] ring-amber-500/5 shadow-sm font-black'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                  {stepErrors.sex && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{stepErrors.sex}</p>}
                </div>
              </div>

              <div className="relative">
                <label className={labelClasses}>Place in Ethiopia (Region/Area)</label>
                <select 
                  required 
                  name="place" 
                  value={formData.place} 
                  onChange={handleChange} 
                  className={selectClasses}
                >
                  <option value="">Select Region</option>
                  <option value="Addis Ababa">Addis Ababa</option>
                  <option value="Afar">Afar</option>
                  <option value="Amhara">Amhara</option>
                  <option value="Benishangul-Gumuz">Benishangul-Gumuz</option>
                  <option value="Central Ethiopia">Central Ethiopia</option>
                  <option value="Dire Dawa">Dire Dawa</option>
                  <option value="Gambela">Gambela</option>
                  <option value="Harari">Harari</option>
                  <option value="Oromia">Oromia</option>
                  <option value="Sidama">Sidama</option>
                  <option value="Somali">Somali</option>
                  <option value="South Ethiopia">South Ethiopia</option>
                  <option value="South West Ethiopia">South West Ethiopia</option>
                  <option value="Tigray">Tigray</option>
                </select>
                <FiChevronDown className="absolute right-5 top-[2.75rem] text-slate-400 pointer-events-none" />
                <FiMapPin className="absolute left-5 top-[2.75rem] text-slate-400" />
                {stepErrors.place && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{stepErrors.place}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: Background & Schedule */}
          {currentStep === 2 && (
            <div className="animate-step space-y-8">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-slate-900 mb-1 font-bold">Select program <span className="italic text-gold-gradient">schedule</span> &amp; format</h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-6">Step 2 of 5: Delivery &amp; Timing</p>
              </div>

              {/* Q5: What best describes you? */}
              <div className="space-y-3">
                <label className={labelClasses}>5. What best describes you?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'High school student', icon: '🎓' },
                    { label: 'University/college student', icon: '🏛️' },
                    { label: 'Recent graduate', icon: '📜' },
                    { label: 'Working professional', icon: '💼' },
                    { label: 'Entrepreneur/business owner', icon: '🚀' },
                    { label: 'Freelancer', icon: '💻' },
                    { label: 'Looking for work', icon: '🔍' },
                    { label: 'Other', icon: '✨' }
                  ].map(({ label, icon }) => {
                    const isSelected = formData.describe_you === label;
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
                            ? 'border-amber-500 bg-amber-500/5 text-slate-900 ring-[4px] ring-amber-500/5 font-bold shadow-sm'
                            : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-600'
                        }`}
                      >
                        <span className="text-xl">{icon}</span>
                        <span className="text-xs font-semibold">{label}</span>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.describe_you && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.describe_you}</p>}
              </div>

              {/* Q7: Learning Mode Choice */}
              <div className="space-y-3">
                <label className={labelClasses}>7. How would you prefer to learn?</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { mode: 'In-person', price: '15,000 ETB', desc: 'Face-to-face immersive workshops' },
                    { mode: 'Online', price: '5,000 ETB', desc: 'Remote digital curriculum' },
                    { mode: 'Hybrid', price: '10,000 ETB', desc: 'Mixed offline & online delivery' },
                  ].map(({ mode, price, desc }) => {
                    const isSelected = formData.learning_mode === `${mode} — ${price}`;
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
                        className={`p-5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-32 md:h-36 ${
                          isSelected 
                            ? 'border-amber-500 bg-amber-500/5 ring-[5px] ring-amber-500/5 shadow-md' 
                            : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-amber-700' : 'text-slate-500'}`}>
                            {mode}
                          </span>
                          {isSelected && <FiCheckCircle className="text-amber-600" />}
                        </div>
                        <div>
                          <p className="text-lg md:text-xl font-extrabold text-slate-900 leading-none mb-1">{price}</p>
                          <p className="text-[9px] md:text-[10px] text-slate-400 leading-tight font-medium">{desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.learning_mode && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.learning_mode}</p>}
              </div>

              {/* Q6: Start Date Schedule Option */}
              <div className="space-y-3">
                <label className={labelClasses}>6. Which date and time would you prefer to start?</label>
                <div className="space-y-3">
                  {[
                    { val: 'Option 1: Sept 14, 2026 — Morning Session (9:00 AM - 12:00 PM)', label: 'Option 1: Sept 14, 2026', time: 'Morning Session (9:00 AM - 12:00 PM)' },
                    { val: 'Option 2: Sept 14, 2026 — Evening Session (6:00 PM - 9:00 PM)', label: 'Option 2: Sept 14, 2026', time: 'Evening Session (6:00 PM - 9:00 PM)' },
                    { val: 'Option 3: Sept 19, 2026 — Weekend Session (Sat & Sun, 9:00 AM - 1:00 PM)', label: 'Option 3: Sept 19, 2026', time: 'Weekend Session (Sat & Sun, 9:00 AM - 1:00 PM)' },
                    { val: 'Option 4: Oct 5, 2026 — Evening Session (6:00 PM - 9:00 PM)', label: 'Option 4: Oct 5, 2026', time: 'Evening Session (6:00 PM - 9:00 PM)' }
                  ].map(({ val, label, time }) => {
                    const isSelected = formData.preferred_schedule === val;
                    return (
                      <button
                        key={val}
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
                            ? 'border-amber-500 bg-amber-500/5 ring-[4px] ring-amber-500/5 shadow-sm'
                            : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">{label}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{time}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-amber-500 border-amber-500 text-[#1C2951]' : 'border-slate-200'
                        }`}>
                          {isSelected && <FiCheck size={12} className="stroke-[3px]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.preferred_schedule && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.preferred_schedule}</p>}
              </div>
            </div>
          )}

          {/* STEP 3: Interests & Opportunities */}
          {currentStep === 3 && (
            <div className="animate-step space-y-8">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-slate-900 mb-1 font-bold">Select your event <span className="italic text-gold-gradient">interests</span> &amp; opportunities</h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-6">Step 3 of 5: Interests &amp; Aspirations</p>
              </div>

              {/* Q7: What types of events would you most like to work on? */}
              <div className="space-y-3">
                <label className={labelClasses}>7. What types of events would you most like to work on? (Select all that apply)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: 'Corporate', icon: '💼' },
                    { label: 'Social', icon: '🎉' },
                    { label: 'Exhibitions', icon: '🎪' },
                    { label: 'Cultural', icon: '🎭' },
                    { label: 'Public', icon: '🌍' }
                  ].map(({ label, icon }) => {
                    const isSelected = formData.event_types.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleEventType(label)}
                        className={`p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/5 text-slate-900 ring-[4px] ring-amber-500/5 font-extrabold shadow-sm'
                            : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-600 font-medium'
                        }`}
                      >
                        <span className="text-2xl">{icon}</span>
                        <span className="text-[11px] font-bold tracking-tight">{label}</span>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.event_types && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.event_types}</p>}
              </div>

              {/* Q8: WHAT KIND OF OPPORTUNITY DO YOU WANT? */}
              <div className="space-y-3">
                <label className={labelClasses}>8. WHAT KIND OF OPPORTUNITY DO YOU WANT? (Select all that apply)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Learning event management',
                    'Getting practical experience',
                    'Internship opportunities',
                    'Working with an event company',
                    'Starting my own business',
                    'Freelancing',
                    'Networking with event professionals',
                    'All of the above',
                    "I'm not sure yet"
                  ].map((opp) => {
                    const isSelected = formData.opportunity_interest.includes(opp);
                    return (
                      <button
                        key={opp}
                        type="button"
                        onClick={() => toggleOpportunity(opp)}
                        className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all duration-300 flex items-center justify-between ${
                          isSelected 
                            ? 'bg-amber-500/10 text-slate-900 border-amber-500 shadow-sm ring-[3px] ring-amber-500/5' 
                            : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                        }`}
                      >
                        <span className="font-semibold text-slate-800">{opp}</span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-amber-500 border-amber-500 text-[#1C2951]' : 'border-slate-200'
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
                <label className={labelClasses}>10. What would you like to learn or achieve in the event industry?</label>
                <textarea 
                  required
                  name="learning_goals" 
                  value={formData.learning_goals} 
                  onChange={handleChange}
                  placeholder="Share your objectives and career expectations..."
                  rows={4}
                  className="w-full bg-white/70 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:border-amber-500/50 focus:bg-white focus:ring-[6px] focus:ring-amber-500/5 outline-none transition-all placeholder:text-slate-300 font-sans shadow-sm hover:border-slate-300 duration-300 resize-none"
                />
                {stepErrors.learning_goals && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.learning_goals}</p>}
              </div>
            </div>
          )}

          {/* STEP 4: Marketing & Consent */}
          {currentStep === 4 && (
            <div className="animate-step space-y-8">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-slate-900 mb-1 font-bold">A few final <span className="italic text-gold-gradient">questions</span></h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-6">Step 4 of 5: Outreach &amp; Preferences</p>
              </div>

              {/* Q9: How did you hear about Yenege Academy? */}
              <div className="space-y-3">
                <label className={labelClasses}>9. How did you hear about Yenege Academy?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'TikTok', icon: '📱' },
                    { label: 'Instagram', icon: '📸' },
                    { label: 'Telegram', icon: '✈️' },
                    { label: 'Facebook', icon: '👥' },
                    { label: 'Friend/referral', icon: '🤝' },
                    { label: 'Event/seminar', icon: '🎤' },
                    { label: 'School/university', icon: '🏛️' },
                    { label: 'Advertisement', icon: '📢' },
                    { label: 'Google/search', icon: '🔍' },
                    { label: 'Yenege staff', icon: '👔' },
                    { label: 'Other', icon: '✨' }
                  ].map(({ label, icon }) => {
                    const isSelected = formData.marketing_source === label;
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
                            ? 'border-amber-500 bg-amber-500/5 text-slate-900 ring-[4px] ring-amber-500/5 font-extrabold shadow-sm'
                            : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-600'
                        }`}
                      >
                        <span className="text-base">{icon}</span>
                        <span className="text-xs font-semibold">{label}</span>
                      </button>
                    );
                  })}
                </div>
                {stepErrors.marketing_source && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{stepErrors.marketing_source}</p>}
              </div>

              {/* Q11: Would you like our team to contact you? */}
              <div className="space-y-3">
                <label className={labelClasses}>11. Would you like our team to contact you about relevant programs and opportunities?</label>
                <div className="space-y-3">
                  {[
                    { label: "Yes, I'd like to be contacted", desc: 'Our customer success agents will reach out' },
                    { label: "I'd like to receive information first", desc: 'Send course outlines and dates to my inbox/Telegram' },
                    { label: "Not right now", desc: 'Submit registration without contact outreach' }
                  ].map(({ label, desc }) => {
                    const isSelected = formData.contact_consent === label;
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
                            ? 'border-amber-500 bg-amber-500/5 ring-[4px] ring-amber-500/5 shadow-sm'
                            : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">{label}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-amber-500 border-amber-500 text-[#1C2951]' : 'border-slate-200'
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
                <label className="flex items-start gap-4 p-4 hover:bg-slate-50/50 rounded-2xl transition-all cursor-pointer border border-slate-100 bg-white/50">
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
                    className="mt-1 w-5 h-5 accent-amber-500 rounded border-slate-200" 
                  />
                  <span className="text-xs text-slate-400 font-medium leading-relaxed">
                    I agree to the program guidelines and want to learn how to launch professional events.
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
                <h3 className="font-serif text-xl sm:text-2xl text-slate-900 mb-1 font-bold">Review and <span className="italic text-gold-gradient">confirm</span> registration</h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-6">Step 5 of 5: Invoice &amp; Submission</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-slate-100">
                <ReviewField label="Full Name" value={formData.name} />
                <ReviewField label="Email Address" value={formData.email || 'N/A'} />
                <ReviewField label="Phone Number" value={formData.phone} />
                <div className="grid grid-cols-2 gap-4">
                  <ReviewField label="Age" value={formData.age} />
                  <ReviewField label="Sex" value={formData.sex} />
                </div>
                <ReviewField label="Region/Place" value={formData.place} />
                <ReviewField label="Status" value={formData.describe_you} />
                <div className="md:col-span-2">
                  <ReviewField label="Preferred Program Schedule" value={formData.preferred_schedule} />
                </div>
                <div className="md:col-span-2">
                  <ReviewField label="Types of Events of Interest" value={formData.event_types.join(', ')} />
                </div>
                <div className="md:col-span-2">
                  <ReviewField label="Opportunities Desired" value={formData.opportunity_interest.join(', ')} />
                </div>
                <div className="md:col-span-2">
                  <ReviewField label="Goals & Objectives" value={formData.learning_goals} />
                </div>
                <ReviewField label="How did you hear about us" value={formData.marketing_source} />
                <ReviewField label="Contact Preference" value={formData.contact_consent} />
              </div>

              {/* Dynamic Invoice / Tuition Breakdown Card */}
              <div className="bg-[#1C2951] text-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-4">Enrollment Summary Invoice</h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-white/10 pb-3">
                    <span className="text-white/70">Selected Format:</span>
                    <span className="font-bold">{formData.learning_mode.split(' — ')[0]}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-white/70">Tuition Fee:</span>
                    <span className="font-extrabold">{calculateFee().toLocaleString()} ETB</span>
                  </div>

                  {referralCode && (
                    <div className="flex justify-between text-violet-300 font-bold bg-white/5 p-2.5 rounded-xl border border-white/5 mt-2">
                      <span className="flex items-center gap-1">🎟️ Referral Applied:</span>
                      <span>{referralCode}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-white/20 pt-4 text-lg font-black mt-4">
                    <span className="text-amber-400">Total Tuition due:</span>
                    <span className="text-amber-400">{calculateFee().toLocaleString()} ETB</span>
                  </div>
                  <p className="text-[9px] text-white/50 leading-relaxed font-medium pt-2">
                    Payment instructions and options will be shared with you by our admissions team upon review.
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full py-5 rounded-[1.5rem] glow-button-amber flex items-center justify-center gap-3 text-sm tracking-[0.2em] uppercase hover:-translate-y-1 active:scale-95 transition-all duration-300 shadow-2xl shadow-amber-500/15 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <><FiLoader className="animate-spin text-[#1C2951]" /> Submitting Reservation...</>
                ) : (
                  <><FiCheck className="stroke-[3px]" /> Complete &amp; Submit</>
                )}
              </button>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-8 mt-10">
            {currentStep > 1 ? (
              <button 
                type="button" 
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all border border-slate-100"
              >
                <FiArrowLeft /> Back
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
                Next <FiArrowRight />
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
    <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">{label}</p>
    <p className="text-xs font-bold text-slate-800 break-words leading-relaxed">{value || 'N/A'}</p>
  </div>
);

export default MasterclassRegistration;
