import React, { useEffect, useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiChevronDown, FiLoader, FiMapPin, FiPhone, FiSend, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/adminApi';

const MasterclassRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    sex: '',
    place: '',
    agreedToTerms: false
  });

  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sex) {
      setError('Please select your sex');
      return;
    }
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsConfirming(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await adminApi.masterclassReservations.create({
        name: formData.name,
        phone: formData.phone,
        age: parseInt(formData.age),
        sex: formData.sex as 'male' | 'female',
        place: formData.place,
      });

      setIsSubmitted(true);
      setIsConfirming(false);
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error('Error submitting reservation:', err);
      setError(err?.message || 'Failed to submit reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const yenegeYellow = "#FFD447";
  const coralOrange = "#FF6F5E";
  const indigoDeep = "#1C2951";

  const inputClasses = "w-full bg-white/60 border border-slate-200 rounded-2xl px-12 py-4 text-slate-900 focus:border-amber-500/50 focus:bg-white focus:ring-[6px] focus:ring-amber-500/5 outline-none transition-all placeholder:text-slate-300 font-sans shadow-sm hover:border-slate-300 transition-all duration-300";
  const labelClasses = "block text-[10px] uppercase tracking-[0.4em] font-black text-slate-500/70 mb-3 ml-1 font-sans";

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
      background: radial-gradient(circle at top right, rgba(255,212,71,0.08) 0%, transparent 40%),
                  radial-gradient(circle at bottom left, rgba(255,111,94,0.05) 0%, transparent 40%),
                  #FAF9F6;
    }
  `;

  if (isSubmitted) {
    return (
      <div className="bg-luxury min-h-screen text-slate-900 flex items-center justify-center p-6 font-sans">
        <style>{sharedStyles}</style>
        <div className="max-w-xl w-full glass-vivid-light p-10 md:p-16 rounded-[3rem] text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/20">
            <FiCheckCircle size={40} />
          </div>
          <h2 className="font-serif text-4xl mb-6 italic tracking-tight text-slate-900 text-gold-gradient">Reservation Received!</h2>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">
            Thank you for registering for the <span className="text-slate-900 font-bold">E-Learning Program Masterclass</span>. Our team will contact you shortly with the next steps.
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

  if (isConfirming) {
    return (
      <div className="bg-luxury min-h-screen text-slate-900 pb-20 font-sans">
        <style>{sharedStyles}</style>
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center gap-4 shadow-sm">
          <button onClick={() => setIsConfirming(false)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-100">
            <FiArrowLeft className="text-slate-600" />
          </button>
          <span className="font-bold tracking-tight text-slate-800">Review Reservation</span>
        </nav>

        <div className="max-w-2xl mx-auto px-6 pt-32">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-amber-600 mb-2">Almost Done</p>
            <h2 className="font-serif text-4xl text-slate-900 tracking-tight">Confirm <span className="italic text-gold-gradient">Details</span></h2>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-10 space-y-8">
              <ReviewField label="Full Name" value={formData.name} />
              <ReviewField label="Phone Number" value={formData.phone} />
              <div className="grid grid-cols-2 gap-8">
                <ReviewField label="Age" value={formData.age} />
                <ReviewField label="Sex" value={formData.sex} />
              </div>
              <ReviewField label="Place in Ethiopia" value={formData.place} />
            </div>
            <div className="p-10 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={handleConfirmSubmit} 
                disabled={isSubmitting}
                className="w-full py-5 rounded-2xl glow-button-amber flex items-center justify-center gap-3 text-sm tracking-[0.2em] uppercase"
              >
                {isSubmitting ? <><FiLoader className="animate-spin" /> Submitting...</> : <><FiSend /> Confirm Reservation</>}
              </button>
              <button 
                onClick={() => setIsConfirming(false)} 
                className="w-full mt-4 py-3 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600"
              >
                Go back & Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-luxury min-h-screen text-slate-900 pb-20 font-sans selection:bg-amber-100 selection:text-amber-900">
      <style>{sharedStyles}</style>

      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-4 flex items-center gap-4">
        <Link to="/masterclass" className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-100">
          <FiArrowLeft className="text-slate-600" />
        </Link>
        <span className="font-bold tracking-tight text-slate-800">Program Reservation</span>
      </nav>

      <div className="pt-32 pb-12 px-6 text-center max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl mb-4 tracking-tighter text-slate-900">
          Masterclass <span className="italic text-gold-gradient">Reservation</span>
        </h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Become a Licensed Event Pro</p>
      </div>

      <div className="max-w-2xl mx-auto px-6">
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">{error}</div>}
        
        <form onSubmit={handleReview} className="space-y-8 bg-white/40 backdrop-blur-md p-8 md:p-12 rounded-[3rem] border border-white shadow-2xl shadow-slate-200/50">
          <div className="space-y-6">
            <div className="relative">
              <label className={labelClasses}>Full Name</label>
              <input required name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="Enter your full name" />
              <FiUser className="absolute left-5 top-[2.85rem] text-slate-300" />
            </div>

            <div className="relative">
              <label className={labelClasses}>Phone Number</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} placeholder="+251 ..." />
              <FiPhone className="absolute left-5 top-[2.85rem] text-slate-300" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative">
                <label className={labelClasses}>Age</label>
                <input required type="number" name="age" value={formData.age} onChange={handleChange} className={inputClasses} placeholder="Years" />
              </div>
              <div className="relative">
                <label className={labelClasses}>Sex</label>
                <select required name="sex" value={formData.sex} onChange={handleChange} className={`${inputClasses} appearance-none overflow-hidden pr-10`}>
                  <option value="">Select Sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <FiChevronDown className="absolute right-5 top-[2.85rem] text-slate-300 pointer-events-none" />
              </div>
            </div>

            <div className="relative">
              <label className={labelClasses}>Place in Ethiopia (Region/Area)</label>
              <select 
                required 
                name="place" 
                value={formData.place} 
                onChange={handleChange} 
                className={`${inputClasses} appearance-none overflow-hidden pr-10`}
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
              <FiChevronDown className="absolute right-5 top-[2.85rem] text-slate-300 pointer-events-none" />
              <FiMapPin className="absolute left-5 top-[2.85rem] text-slate-300" />
            </div>

          </div>

          <label className="flex items-start gap-4 p-4 hover:bg-white/50 rounded-2xl transition-all cursor-pointer">
            <input required type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} className="mt-1 w-5 h-5 accent-amber-500 rounded border-slate-200" />
            <span className="text-xs text-slate-400 font-medium leading-relaxed">
              I agree to the program guidelines and want to learn how to launch professional events.
            </span>
          </label>

          <button 
            type="submit" 
            className="w-full py-5 rounded-[1.5rem] glow-button-amber shadow-2xl shadow-amber-500/20 font-black text-sm tracking-[0.2em] uppercase hover:-translate-y-1 active:scale-95 transition-all duration-300"
          >
            Review Reservation
          </button>
        </form>
      </div>
    </div>
  );
};

const ReviewField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] uppercase tracking-widest font-black text-slate-300 mb-1">{label}</p>
    <p className="text-lg font-bold text-slate-800">{value}</p>
  </div>
);

export default MasterclassRegistration;
