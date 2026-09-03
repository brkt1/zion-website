import { useEffect, useState } from "react";
import {
  FaEnvelope,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhone,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
  FaCheckCircle
} from "react-icons/fa";
import { ContactSkeleton } from "../Components/ui/ContactSkeleton";
import { useLanguage } from "../contexts/LanguageContext";
import { useContactInfo } from "../hooks/useApi";
import { useScrollReveal } from "../hooks/useScrollReveal";

const Contact = () => {
  useScrollReveal();
  const { t } = useLanguage();
  const { contactInfo, isLoading } = useContactInfo();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  
  useEffect(() => {
    document.title = "Contact Us | YENEGE - Connect for Event Production & Academy";
    window.scrollTo(0, 0);
  }, []);

  const fallbackContact = {
    email: "yenegeevents@gmail.com",
    phone: "+251978639887",
    phoneFormatted: "+251 978 639 887",
    location: "Amir Commercial Complex, 12th Floor, Office No. 12-003, Gabon St (Olympia), Bole Sub-city, Addis Ababa, Ethiopia",
  };

  const finalContact = contactInfo || fallbackContact;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const whatsappMessage = `Hello Yenege Team! I'm ${formData.name}.\n\n` +
        `✉️ Email: ${formData.email}\n` +
        (formData.phone ? `📞 Phone: ${formData.phone}\n` : '') +
        `\n💬 Message:\n${formData.message}`;
      
      const phoneNumber = finalContact?.phone?.replace(/\D/g, '') || "251978639887";
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
      
      setTimeout(() => setSubmitStatus("idle"), 6000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus("error");
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading && !contactInfo) {
    return <ContactSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-x-hidden selection:bg-[#FFD447] selection:text-[#1C2951] pb-24">
      {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
      <section className="relative pt-32 lg:pt-40 pb-16 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-radial from-[#FFD447]/10 via-transparent to-transparent blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-radial from-[#FF6F5E]/10 via-transparent to-transparent blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mx-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD447] shadow-[0_0_12px_#FFD447]" />
            <span className="text-[#FFD447] font-black text-xs uppercase tracking-[0.25em]">CONNECT WITH OUR TEAM</span>
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white max-w-4xl mx-auto">
            Let's Architect Your Next <br />
            <span className="bg-gradient-to-r from-[#FFD447] via-[#FF6F5E] to-[#7B5CFF] bg-clip-text text-transparent italic">Unforgettable Experience</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
            Have a question about event execution, sponsorship strategy, or enrolling in Yenege Academy? We are here to help.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTACT CONTENT ────────────────────────────────────────── */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Contact Cards */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Studio Address Card */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4 hover:border-white/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD447]/10 text-[#FFD447] flex items-center justify-center text-xl border border-[#FFD447]/20">
                  <FaMapMarkerAlt />
                </div>
                <h3 className="font-heading text-xl font-bold text-white">Our Head Studio</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {finalContact.location}
                </p>
              </div>

              {/* Email Card */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4 hover:border-white/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#FF6F5E]/10 text-[#FF6F5E] flex items-center justify-center text-xl border border-[#FF6F5E]/20">
                  <FaEnvelope />
                </div>
                <h3 className="font-heading text-xl font-bold text-white">Email Enquiries</h3>
                <a 
                  href={`mailto:${finalContact.email || 'yenegeevents@gmail.com'}`}
                  className="text-xs text-slate-300 hover:text-[#FFD447] transition-colors font-medium block underline"
                >
                  {finalContact.email || 'yenegeevents@gmail.com'}
                </a>
              </div>

              {/* Phone & Hotline Card */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4 hover:border-white/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#7B5CFF]/10 text-[#7B5CFF] flex items-center justify-center text-xl border border-[#7B5CFF]/20">
                  <FaPhone />
                </div>
                <h3 className="font-heading text-xl font-bold text-white">Direct Line &amp; Support</h3>
                <a 
                  href={`tel:${finalContact.phone?.replace(/\D/g, '') || '251978639887'}`}
                  className="text-xs text-slate-300 hover:text-[#FFD447] transition-colors font-medium block"
                >
                  {finalContact.phoneFormatted || finalContact.phone || '+251 978 639 887'}
                </a>
              </div>

              {/* Social Channels */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4">
                <h3 className="font-heading text-lg font-bold text-white">Official Channels</h3>
                <div className="flex gap-3">
                  {[
                    { icon: <FaInstagram />, href: "https://instagram.com/yenege_event" },
                    { icon: <FaTelegram />, href: "https://t.me/yenegeevents" },
                    { icon: <FaTiktok />, href: "https://tiktok.com/@yenegeevents" },
                    { icon: <FaYoutube />, href: "https://youtube.com/@yenegeevents" },
                  ].map((social, i) => (
                    <a 
                      key={i} 
                      href={social.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-[#FFD447] text-white hover:text-[#1C2951] border border-white/10 flex items-center justify-center text-lg transition-all"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Form */}
            <div className="lg:col-span-7 bg-[#1E293B]/80 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl space-y-8">
              <div>
                <h2 className="font-heading text-3xl font-black text-white mb-2">Send Us a Direct Message</h2>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Fill in your details below. Your message will be formatted and sent directly to our team via WhatsApp for an immediate response.
                </p>
              </div>

              {submitStatus === "success" && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <FaCheckCircle className="text-base shrink-0" />
                  <span>WhatsApp conversation initiated! Check your WhatsApp window to send.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#FFD447] mb-2">Your Full Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      placeholder="e.g. Abebe Bikila" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className="w-full bg-[#0F172A]/80 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-[#FFD447] focus:outline-none transition-all placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#FFD447] mb-2">Email Address *</label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      placeholder="name@example.com" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="w-full bg-[#0F172A]/80 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-[#FFD447] focus:outline-none transition-all placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#FFD447] mb-2">Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="+251 9XX XXX XXX" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="w-full bg-[#0F172A]/80 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-[#FFD447] focus:outline-none transition-all placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#FFD447] mb-2">Message or Inquiry *</label>
                  <textarea 
                    name="message" 
                    required 
                    rows={5} 
                    placeholder="Tell us about your event vision, partnership ideas, or enrollment questions..." 
                    value={formData.message} 
                    onChange={handleChange} 
                    className="w-full bg-[#0F172A]/80 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-[#FFD447] focus:outline-none transition-all placeholder:text-slate-500 resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] hover:from-[#ffe066] hover:to-[#ff8273] text-[#1C2951] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#FF6F5E]/20 hover:scale-[1.01]"
                >
                  <FaWhatsapp size={18} />
                  <span>{isSubmitting ? "Opening WhatsApp..." : "Send Message Via WhatsApp"}</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
