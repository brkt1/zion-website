import React, { useEffect, useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiChevronDown, FiEdit2, FiGlobe, FiInstagram, FiLoader, FiMail, FiPhone, FiSend, FiShield, FiUser } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import { api, ContactInfo } from '../services/api';

const ExpoRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    socialMedia: '',
    category: '',
    boothType: '',
    paymentOption: '',
    agreedToGuidelines: false,
    agreedToNonRefundable: false,
    confirmAccuracy: false
  });

  // 3-stage flow: form → confirming → submitted
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic contact info from Supabase
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [contactLoading, setContactLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchContactInfo();

    // Pre-fill booth type from URL query param (?booth=premium|standard|shared)
    const params = new URLSearchParams(location.search);
    const presetBooth = params.get('booth');
    if (presetBooth && ['premium', 'standard', 'shared'].includes(presetBooth)) {
      setFormData(prev => ({ ...prev, boothType: presetBooth }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchContactInfo = async () => {
    try {
      const data = await api.getContactInfo();
      setContactInfo(data);
    } catch (err) {
      console.warn('Could not load contact info, using defaults:', err);
    } finally {
      setContactLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Step 1: Validate form → show confirmation screen
  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsConfirming(true);
  };

  // Step 2: Confirmed → actually send to DB
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await adminApi.expoApplications.create({
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        socialMedia: formData.socialMedia || undefined,
        category: formData.category,
        boothType: formData.boothType,
        paymentOption: formData.paymentOption || undefined,
      });

      setIsSubmitting(false);
      setIsConfirming(false);
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err?.message || 'Failed to submit application. Please try again.');
      setIsSubmitting(false);
    }
  };

  const yenegeYellow = "#FFD447";
  const coralOrange = "#FF6F5E";
  const indigoDeep = "#1C2951";

  const inputClasses = "w-full bg-white/60 border border-slate-200 rounded-2xl px-12 py-4 text-slate-900 focus:border-amber-500/50 focus:bg-white focus:ring-[6px] focus:ring-amber-500/5 outline-none transition-all placeholder:text-slate-300 font-sans shadow-sm hover:border-slate-300";
  const labelClasses = `block text-[10px] uppercase tracking-[0.4em] font-black text-slate-500/70 mb-3 ml-1 font-sans`;

  // Resolved contact values with smart fallbacks
  const displayPhone = contactInfo?.phoneFormatted || contactInfo?.phone || '+251 978 639 887';
  const displayPhoneRaw = contactInfo?.phone || '+251978639887';
  const displayEmail = contactInfo?.email || 'bereketyosef49@gmail.com';

  const getBoothLabel = (id: string) => {
    const map: Record<string, string> = {
      premium: 'Premium Platinum — 200,000 ETB',
      standard: 'Diamond Inline — 100,000 ETB',
      shared: 'Shared / Creative — 75,000 ETB',
    };
    return map[id] || id;
  };

  const getCategoryLabel = (id: string) => {
    const map: Record<string, string> = {
      planners: 'Wedding Planners & Architects',
      decor: 'Floral & Scenography Designers',
      photo: 'Visual Storytellers (Photo/Video)',
      makeup: 'Bridal Beauty & Makeup Artistry',
      bridal: 'Bridal Fashion & Haute Couture',
      jewelry: 'High Jewelry & Goldsmiths',
      catering: 'Gastronomic Services',
      travel: 'Travel & Honeymoon Designers',
      other: 'Other Premium Services',
    };
    return map[id] || id;
  };

  const getPaymentLabel = (id: string) => {
    const map: Record<string, string> = {
      full: 'Pay Full Amount (100%)',
      deposit: 'Pay 50% Deposit',
    };
    return map[id] || id;
  };

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Manrope:wght@300;400;600;800&display=swap');
    .font-serif { font-family: 'Playfair Display', serif; }
    .font-sans  { font-family: 'Manrope', sans-serif; }
    .glass-vivid-light {
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,1);
      box-shadow: 0 40px 100px -20px rgba(0,0,0,0.08);
    }
    @keyframes gold-dust {
      0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
      50%  { opacity: 0.8; }
      100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
    }
    .gold-particle {
      position: absolute; width: 5px; height: 5px;
      background: ${yenegeYellow}; border-radius: 50%;
      pointer-events: none; animation: gold-dust 5s linear infinite;
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
  `;

  // ─── REVIEW / CONFIRMATION SCREEN ─────────────────────────────────────────
  if (isConfirming) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen text-slate-900 pb-40">
        <style>{sharedStyles}</style>

        {/* Header */}
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center gap-4 shadow-sm">
          <button
            onClick={() => { setIsConfirming(false); setError(null); }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-100 active:scale-90 transition-transform"
          >
            <FiArrowLeft className="text-slate-600" />
          </button>
          <div>
            <span className="font-bold tracking-tight text-slate-800 block leading-tight">Review Your Application</span>
            <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Confirm before sending</span>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-6 pt-36 pb-10">

          {/* Title */}
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-amber-600 mb-3">Final Review</p>
            <h2 className="font-serif text-4xl md:text-5xl text-slate-900 tracking-tight">
              Check your <span className="italic text-gold-gradient">details</span>
            </h2>
            <p className="mt-4 text-slate-400 text-sm font-medium">
              Please review all information carefully. Once confirmed, your application will be submitted to the expo team.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium flex items-start gap-3">
              <span className="text-lg">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Review Card */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

            {/* Brand Identity */}
            <div className="p-8 border-b border-slate-50">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-5">Brand Identity</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ReviewField label="Company Name" value={formData.companyName} />
                <ReviewField label="Representative" value={formData.contactPerson} />
                <ReviewField label="Phone" value={formData.phone} />
                <ReviewField label="Email" value={formData.email} />
                {formData.socialMedia && <ReviewField label="Social Media" value={formData.socialMedia} />}
                <ReviewField label="Category" value={getCategoryLabel(formData.category)} />
              </div>
            </div>

            {/* Space & Payment */}
            <div className="p-8 border-b border-slate-50 bg-amber-50/30">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-5">Space & Payment</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ReviewField label="Booth Type" value={getBoothLabel(formData.boothType)} highlight />
                <ReviewField label="Payment Plan" value={getPaymentLabel(formData.paymentOption)} />
              </div>
            </div>

            {/* Agreements */}
            <div className="p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-5">Agreements Accepted</p>
              <div className="space-y-3">
                {[
                  'Exhibitor Guidelines & event rules',
                  'Non-refundable payment policy',
                  'Accuracy of all provided information',
                ].map((text) => (
                  <div key={text} className="flex items-center gap-3">
                    <FiCheckCircle className="text-green-500 flex-shrink-0" size={16} />
                    <span className="text-sm text-slate-600 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Edit reminder */}
          <div className="mt-5 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
            <FiEdit2 size={12} />
            <span>Not right?</span>
            <button
              onClick={() => { setIsConfirming(false); setError(null); }}
              className="text-amber-600 font-black hover:underline"
            >
              Go back and edit
            </button>
          </div>
        </div>

        {/* Sticky Confirm Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 z-[100] bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/90 to-transparent">
          <div className="max-w-md mx-auto space-y-3">
            <button
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className={`w-full relative overflow-hidden py-5 rounded-2xl font-sans font-black text-sm tracking-widest uppercase transition-all duration-300 shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-3 ${
                isSubmitting
                  ? 'bg-slate-100 text-slate-400 cursor-wait'
                  : 'glow-button-amber hover:scale-[1.02] active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin" size={16} />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FiSend size={16} />
                  <span>Confirm &amp; Submit Application</span>
                </>
              )}
            </button>
            <button
              onClick={() => { setIsConfirming(false); setError(null); }}
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              ← Edit My Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen text-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <style>{sharedStyles}</style>

        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="gold-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100 + 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random()
            }}
          />
        ))}

        <div className="max-w-xl w-full glass-vivid-light p-10 md:p-20 rounded-[4rem] text-center relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-full flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-amber-500/20">
            <FiCheckCircle size={48} />
          </div>

          <h2 className="font-serif text-5xl mb-6 italic tracking-tight text-slate-900">Application Submitted!</h2>

          <div className="font-sans text-slate-500 mb-12 space-y-6 leading-relaxed text-lg font-medium text-left bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
            <p className="text-slate-700">
              Thank you for applying to exhibit at{' '}
              <span className="text-amber-600 font-bold">Yene Ken Wedding Expo 2026</span>.
            </p>
            <p>
              Our team will review your application and confirm your booth allocation within{' '}
              <span className="text-slate-900 font-bold">24 hours</span>.
            </p>
            <p className="text-sm">
              To secure your booth, please complete payment promptly as spaces are limited and allocated on a{' '}
              <span className="text-slate-900 font-bold">first-come, first-served</span> basis.
            </p>

            <div className="pt-6 border-t border-slate-200">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-4">For Assistance</p>
              {contactLoading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <FiLoader className="animate-spin" size={14} />
                  <span>Loading contact info...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <a
                    href={`tel:${displayPhoneRaw}`}
                    className="flex items-center gap-3 text-slate-800 hover:text-amber-600 transition-colors"
                  >
                    <FiPhone size={14} className="text-amber-500" />
                    <span className="text-sm font-bold">{displayPhone}</span>
                  </a>
                  <a
                    href={`mailto:${displayEmail}`}
                    className="flex items-center gap-3 text-slate-800 hover:text-amber-600 transition-colors"
                  >
                    <FiMail size={14} className="text-amber-500" />
                    <span className="text-sm font-bold">{displayEmail}</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          <Link
            to="/expo-info"
            className="group relative inline-flex items-center gap-3 bg-slate-900 text-white px-12 py-5 rounded-full font-sans font-black hover:scale-105 transition-all shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-amber-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 tracking-widest text-xs uppercase">Return to Info Page</span>
            <FiArrowLeft className="relative z-10 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // ─── REGISTRATION FORM ─────────────────────────────────────────────────────
  return (
    <div className="bg-[#FAF9F6] min-h-screen text-slate-900 font-sans pb-40 overflow-x-hidden selection:bg-amber-100 selection:text-amber-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Manrope:wght@300;400;500;700;800&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }

        .glass-panel-light {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,1);
          box-shadow: 0 20px 60px -10px rgba(0,0,0,0.03);
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .glass-panel-light:hover {
          background: rgba(255,255,255,0.9);
          box-shadow: 0 40px 100px -20px rgba(255,212,71,0.15);
          transform: translateY(-4px);
        }
        .glow-button-light {
          background: linear-gradient(135deg, ${yenegeYellow} 0%, ${coralOrange} 100%);
          color: ${indigoDeep}; position: relative; overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4,0,0.2,1); font-weight: 800;
        }
        .glow-button-light::after {
          content:''; position:absolute; top:0; left:-100%; width:100%; height:100%;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);
          transition: 0.6s;
        }
        .glow-button-light:hover::after { left:100%; }
        .input-icon-wrap { position: relative; }
        .input-icon {
          position: absolute; left: 1.25rem; top: 1.15rem;
          color:#cbd5e1; transition: color 0.3s ease;
        }
        input:focus + .input-icon, select:focus + .input-icon { color: ${coralOrange}; }
        .luxury-gradient-bg {
          background:
            radial-gradient(circle at top right, rgba(255,212,71,0.1) 0%, transparent 40%),
            radial-gradient(circle at bottom left, rgba(255,111,94,0.05) 0%, transparent 40%);
        }
        .text-gold-gradient {
          background: linear-gradient(135deg, ${yenegeYellow}, ${coralOrange});
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
      `}</style>

      <div className="fixed inset-0 luxury-gradient-bg pointer-events-none" />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-[100] glass-panel-light border-b border-white/20 px-6 py-4 flex items-center gap-4">
        <Link to="/expo-info" className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-100 active:scale-90 transition-transform">
          <FiArrowLeft className="text-slate-600" />
        </Link>
        <span className="font-bold tracking-tight text-slate-800">Become an Exhibitor</span>
      </nav>

      {/* Hero */}
      <div className="relative pt-40 pb-12 px-6 text-center max-w-2xl mx-auto leading-relaxed">
        <h1 className="font-serif text-4xl md:text-5xl mb-4 tracking-tighter text-slate-900 leading-tight">
          Exhibitor Application <br />
          <span className="italic text-gold-gradient text-3xl md:text-5xl">የኔ ቀን ኤክስፖ የኤግዚቢተር ምዝገባ</span>
        </h1>
        <p className="font-sans text-[10px] text-slate-400 uppercase tracking-[0.4em] font-black mb-8">Official Registration Portal</p>

        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-[10px] uppercase tracking-[0.3em] font-black text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFD447]" />
            <span>መጋቢት 27–28</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFD447]" />
            <span>Addis Ababa</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-3xl text-red-700 text-sm font-medium flex items-start gap-3">
            <span className="text-red-500 text-lg">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleReview} className="space-y-12">

          {/* Section 1 - Brand Identity */}
          <div className="glass-panel-light p-8 md:p-20 rounded-[4rem] relative overflow-hidden group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-12 bg-amber-500" />
                  <span className="text-amber-600 font-sans tracking-[0.4em] uppercase text-[10px] font-black">Identity</span>
                </div>
                <h3 className="font-serif text-5xl text-slate-900 tracking-tight">The <span className="italic text-gold-gradient">Brand</span></h3>
              </div>
              <FiUser className="text-6xl text-slate-100 group-hover:text-amber-500/20 transition-all duration-700" />
            </div>

            <div className="grid grid-cols-1 gap-y-8">
              <div className="input-icon-wrap">
                <label className={labelClasses}>Company Name</label>
                <input required type="text" name="companyName" value={formData.companyName} onChange={handleChange} className={inputClasses} placeholder="e.g. Elegant Decor Addis" />
                <FiGlobe className="input-icon" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                <div className="input-icon-wrap">
                  <label className={labelClasses}>Primary Curator</label>
                  <input required type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className={inputClasses} placeholder="Full name" />
                  <FiUser className="input-icon" />
                </div>
                <div className="input-icon-wrap">
                  <label className={labelClasses}>Direct Line</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} placeholder="+251..." />
                  <FiPhone className="input-icon" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                <div className="input-icon-wrap">
                  <label className={labelClasses}>Digital Mail</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} placeholder="example@brand.com" />
                  <FiMail className="input-icon" />
                </div>
                <div className="input-icon-wrap">
                  <label className={labelClasses}>Social Portfolio</label>
                  <input type="text" name="socialMedia" value={formData.socialMedia} onChange={handleChange} className={inputClasses} placeholder="@instagram" />
                  <FiInstagram className="input-icon" />
                </div>
              </div>

              <div className="input-icon-wrap">
                <label className={labelClasses}>Business Category</label>
                <div className="relative">
                  <select required name="category" value={formData.category} onChange={handleChange} className={`${inputClasses} appearance-none cursor-pointer pr-12`}>
                    <option value="">Select Category</option>
                    <option value="planners">Wedding Planners &amp; Architects</option>
                    <option value="decor">Floral &amp; Scenography Designers</option>
                    <option value="photo">Visual Storytellers (Photo/Video)</option>
                    <option value="makeup">Bridal Beauty &amp; Makeup Artistry</option>
                    <option value="bridal">Bridal Fashion &amp; Haute Couture</option>
                    <option value="jewelry">High Jewelry &amp; Goldsmiths</option>
                    <option value="catering">Gastronomic Services</option>
                    <option value="travel">Travel &amp; Honeymoon Designers</option>
                    <option value="other">Other Premium Services</option>
                  </select>
                  <FiGlobe className="input-icon" />
                  <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 - Booth Selection — hidden if pre-selected from info page */}
          {formData.boothType && new URLSearchParams(location.search).get('booth') && (
            // Compact locked display when booth was pre-chosen on the info page
            <div className="glass-panel-light p-8 md:p-12 rounded-[4rem] relative overflow-hidden">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-[2px] w-12 bg-amber-500" />
                <span className="text-amber-600 font-sans tracking-[0.4em] uppercase text-[10px] font-black">Your Selected Space</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h3 className="font-serif text-3xl text-slate-900 tracking-tight">
                    {formData.boothType === 'premium' && 'Premium Platinum'}
                    {formData.boothType === 'standard' && 'Diamond Inline'}
                    {formData.boothType === 'shared' && 'Shared / Creative'}
                  </h3>
                  <p className="font-sans text-slate-400 text-sm mt-1">
                    {formData.boothType === 'premium' && '12m² · 200,000 ETB · Prime Location'}
                    {formData.boothType === 'standard' && '9m² · 100,000 ETB · Main Rows'}
                    {formData.boothType === 'shared' && '4m² · 75,000 ETB · Creative Zone'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-full bg-amber-100 border border-amber-200">
                    <span className="text-amber-700 font-black text-[10px] uppercase tracking-widest">✓ Pre-selected</span>
                  </div>
                  <Link
                    to="/expo-info#packages"
                    className="text-[10px] text-slate-400 hover:text-amber-600 font-black uppercase tracking-widest transition-colors underline underline-offset-4"
                  >
                    Change
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Section 2b — when no booth pre-set, show the full picker */}
          {!new URLSearchParams(location.search).get('booth') && (
            <div className="glass-panel-light p-8 md:p-20 rounded-[4rem] relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-[2px] w-12 bg-amber-500" />
                    <span className="text-amber-600 font-sans tracking-[0.4em] uppercase text-[10px] font-black">Spatial</span>
                  </div>
                  <h3 className="font-serif text-5xl text-slate-900 tracking-tight">The <span className="italic text-gold-gradient">Space</span></h3>
                </div>
                <FiShield className="text-6xl text-slate-100" />
              </div>

              <div className="grid gap-6">
                {[
                  { id: 'premium', label: 'Premium Platinum', price: '200,000 ETB', desc: 'Prime location, 12m²' },
                  { id: 'standard', label: 'Diamond Inline', price: '100,000 ETB', desc: 'Main rows, 9m²' },
                  { id: 'shared', label: 'Shared / Creative', price: '75,000 ETB', desc: 'Startups, 4m²' }
                ].map((booth) => (
                  <label
                    key={booth.id}
                    className={`group relative flex flex-col md:flex-row md:items-center justify-between p-10 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 overflow-hidden ${
                      formData.boothType === booth.id
                        ? 'border-[#FFD447] bg-white shadow-xl shadow-amber-500/10'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-8 mb-6 md:mb-0">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${formData.boothType === booth.id ? 'border-[#FFD447] bg-[#FFD447] shadow-xl' : 'border-slate-200'}`}>
                        {formData.boothType === booth.id && <div className="w-3 h-3 rounded-full bg-white" />}
                      </div>
                      <input required type="radio" name="boothType" value={booth.id} checked={formData.boothType === booth.id} onChange={handleChange} className="hidden" />
                      <div>
                        <span className="font-sans font-black text-xl text-slate-800 block tracking-tight">{booth.label}</span>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1 font-bold">{booth.desc}</p>
                      </div>
                    </div>
                    <div className="font-serif text-3xl text-slate-900 font-bold tracking-tighter">{booth.price}</div>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="glass-panel-light p-8 md:p-20 rounded-[4rem] relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-12 bg-amber-500" />
                  <span className="text-amber-600 font-sans tracking-[0.4em] uppercase text-[10px] font-black">Financial</span>
                </div>
                <h3 className="font-serif text-5xl text-slate-900 tracking-tight">Payment <span className="italic text-gold-gradient">Option</span></h3>
              </div>
              <FiShield className="text-6xl text-slate-100" />
            </div>

            <div className="grid gap-6">
              {[
                { id: 'full', label: 'Pay Full Amount', desc: '100% immediate payment' },
                { id: 'deposit', label: 'Pay 50% Deposit', desc: 'Balance due before event' }
              ].map((option) => (
                <label
                  key={option.id}
                  className={`group relative flex flex-col md:flex-row md:items-center justify-between p-10 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 overflow-hidden ${
                    formData.paymentOption === option.id
                      ? 'border-[#FFD447] bg-white shadow-xl shadow-amber-500/10'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-8">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentOption === option.id ? 'border-[#FFD447] bg-[#FFD447] shadow-xl' : 'border-slate-200'}`}>
                      {formData.paymentOption === option.id && <div className="w-3 h-3 rounded-full bg-white" />}
                    </div>
                    <input required type="radio" name="paymentOption" value={option.id} checked={formData.paymentOption === option.id} onChange={handleChange} className="hidden" />
                    <div>
                      <span className="font-sans font-black text-xl text-slate-800 block tracking-tight">{option.label}</span>
                      <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1 font-bold">{option.desc}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4 - Agreement */}
          <div className="glass-panel-light p-8 md:p-20 rounded-[4rem]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-12 bg-amber-500" />
                  <span className="text-amber-600 font-sans tracking-[0.4em] uppercase text-[10px] font-black">Governance</span>
                </div>
                <h3 className="font-serif text-5xl text-slate-900 tracking-tight">Legal <span className="italic text-gold-gradient">Covenant</span></h3>
              </div>
            </div>

            <div className="space-y-8">
              {[
                { id: 'agreedToGuidelines', text: 'I agree to follow the Exhibitor Guidelines and event rules.' },
                { id: 'agreedToNonRefundable', text: 'I understand that all payments are non-refundable after booking.' },
                { id: 'confirmAccuracy', text: 'I confirm all information provided is accurate and truthful.' }
              ].map((agreement) => (
                <label key={agreement.id} className="flex items-start gap-6 p-6 hover:bg-slate-50 rounded-3xl cursor-pointer group transition-all border border-transparent hover:border-slate-100">
                  <div className="relative mt-1">
                    <input required type="checkbox" name={agreement.id} checked={(formData as any)[agreement.id]} onChange={handleChange} className="peer w-6 h-6 opacity-0 absolute inset-0 cursor-pointer" />
                    <div className="w-6 h-6 border-2 border-slate-200 rounded-lg transition-all peer-checked:bg-[#FFD447] peer-checked:border-[#FFD447] flex items-center justify-center">
                      <FiCheckCircle className="text-white scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                  </div>
                  <span className="text-sm md:text-base text-slate-500 leading-relaxed font-medium group-hover:text-slate-900 transition-colors">
                    {agreement.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Dynamic contact info strip */}
          {!contactLoading && (
            <div className="glass-panel-light p-6 rounded-3xl flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-300">Questions?</span>
              <a href={`tel:${displayPhoneRaw}`} className="flex items-center gap-2 hover:text-amber-600 transition-colors font-semibold">
                <FiPhone size={13} className="text-amber-500" />
                {displayPhone}
              </a>
              <a href={`mailto:${displayEmail}`} className="flex items-center gap-2 hover:text-amber-600 transition-colors font-semibold">
                <FiMail size={13} className="text-amber-500" />
                {displayEmail}
              </a>
            </div>
          )}

          <div className="pt-8 mb-12">
            <div className="sticky bottom-6 z-50 max-w-md mx-auto">
              <div className="absolute inset-0 bg-[#FAF9F6] blur-xl scale-125 opacity-80 pointer-events-none" />
              <button
                type="submit"
                className="w-full relative z-10 group overflow-hidden py-5 rounded-3xl glow-button-light font-sans font-black text-sm tracking-widest uppercase transition-all duration-500 shadow-2xl shadow-amber-500/40 hover:-translate-y-1 active:scale-95 border-2 border-[#FFD447]/30"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <span>Review My Application</span>
                  <FiChevronDown className="rotate-[-90deg] text-lg transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Small helper component for the review card fields
const ReviewField = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div>
    <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">{label}</p>
    <p className={`text-sm font-bold ${highlight ? 'text-amber-700' : 'text-slate-800'}`}>{value || '—'}</p>
  </div>
);

export default ExpoRegistration;
