import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaEnvelope,
  FaExternalLinkAlt,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhone,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
  FaYoutube
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { useContactInfo } from "../hooks/useApi";
import { useScrollReveal } from "../hooks/useScrollReveal";

const Contact = () => {
  useScrollReveal();
  const { t, language } = useLanguage();
  const { contactInfo } = useContactInfo();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  
  useEffect(() => {
    document.title = `${t.contact?.title || 'Contact Us'} | YENEGE`;
    window.scrollTo(0, 0);
  }, [t, language]);

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

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-[#D4AF37] selection:text-black pb-24">
      
      {/* ── TOP EVENT DISCOVERY & EVENTJOBS CALLOUT ──────────────────────── */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white">
                Discover Events &amp; Event Industry Jobs
              </p>
              <p className="text-[11px] text-white/50">
                Browse our live event listings and career opportunities directly on yenege.events.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <a
              href="https://yenege.events"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#F5BD42] text-black text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-[#D4AF37]/20"
            >
              <span>Visit yenege.events</span>
              <FaExternalLinkAlt size={10} />
            </a>
            <a
              href="https://yenege.events"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-black tracking-wider uppercase transition-all"
            >
              <span>EventJobs</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
      <section className="relative pt-12 sm:pt-16 lg:pt-20 pb-16 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-radial from-[#D4AF37]/15 via-transparent to-transparent blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-radial from-[#D4AF37]/5 via-transparent to-transparent blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mx-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] shadow-[0_0_12px_#D4AF37]" />
            <span className="text-[#D4AF37] font-black text-xs uppercase tracking-[0.25em]">{t.contact?.label || "CONNECT WITH OUR TEAM"}</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white max-w-4xl mx-auto">
            {t.contact?.title || "Let's Architect Your Next"} <br />
            <span className="text-[#D4AF37] italic">
              {t.contact?.subtitle || "Unforgettable Experience"}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/70 font-medium leading-relaxed max-w-2xl mx-auto">
            {t.contact?.desc || "Have a question about event execution, sponsorship strategy, or enrolling in Yenege Academy? We are here to help."}
          </p>
        </div>
      </section>

      {/* ── MAIN CONTACT CONTENT ────────────────────────────────────────── */}
      <section className="py-8 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Contact Cards */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Studio Address Card */}
              <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/10 space-y-4 hover:border-[#D4AF37]/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-black text-[#D4AF37] flex items-center justify-center text-xl border border-white/10">
                  <FaMapMarkerAlt />
                </div>
                <h3 className="font-heading text-xl font-bold text-white">{t.contact?.headStudioTitle || "Our Head Studio"}</h3>
                <p className="text-xs text-white/60 leading-relaxed font-medium">
                  {finalContact.location}
                </p>
              </div>

              {/* Email Card */}
              <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/10 space-y-4 hover:border-[#D4AF37]/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-black text-[#D4AF37] flex items-center justify-center text-xl border border-white/10">
                  <FaEnvelope />
                </div>
                <h3 className="font-heading text-xl font-bold text-white">{t.contact?.emailEnquiriesTitle || "Email Enquiries"}</h3>
                <a 
                  href={`mailto:${finalContact.email || 'yenegeevents@gmail.com'}`}
                  className="text-xs text-white/70 hover:text-[#D4AF37] transition-colors font-medium block underline"
                >
                  {finalContact.email || 'yenegeevents@gmail.com'}
                </a>
              </div>

              {/* Phone & Hotline Card */}
              <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/10 space-y-4 hover:border-[#D4AF37]/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-black text-[#D4AF37] flex items-center justify-center text-xl border border-white/10">
                  <FaPhone />
                </div>
                <h3 className="font-heading text-xl font-bold text-white">{t.contact?.phoneHotlineTitle || "Direct Line & Support"}</h3>
                <a 
                  href={`tel:${finalContact.phone?.replace(/\D/g, '') || '251978639887'}`}
                  className="text-xs text-white/70 hover:text-[#D4AF37] transition-colors font-medium block"
                >
                  {finalContact.phoneFormatted || finalContact.phone || '+251 978 639 887'}
                </a>
              </div>

              {/* Social Channels */}
              <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/10 space-y-4">
                <h3 className="font-heading text-lg font-bold text-white">{t.contact?.officialChannelsTitle || "Official Channels"}</h3>
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
                      className="w-12 h-12 rounded-2xl bg-black hover:bg-[#D4AF37] hover:text-black text-white border border-white/10 flex items-center justify-center text-lg transition-all"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Form */}
            <div className="lg:col-span-7 bg-[#0A0A0A] p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl space-y-8">
              <div>
                <h2 className="font-heading text-3xl font-black text-white mb-2">{t.contact?.formTitle || "Send Us a Direct Message"}</h2>
                <p className="text-xs text-white/60 font-medium leading-relaxed">
                  {t.contact?.formSub || "Fill in your details below. Your message will be formatted and sent directly to our team via WhatsApp for an immediate response."}
                </p>
              </div>

              {submitStatus === "success" && (
                <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-white text-xs font-bold flex items-center gap-2">
                  <FaCheckCircle className="text-base shrink-0 text-[#D4AF37]" />
                  <span>{t.contact?.waSuccess || "WhatsApp conversation initiated! Check your WhatsApp window to send."}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">{t.contact?.name || "Full Name"} *</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      placeholder="e.g. Abebe Bikila" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all placeholder:text-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">{t.contact?.email || "Email Address"} *</label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      placeholder="name@example.com" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all placeholder:text-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">{t.contact?.phone || "Phone Number"}</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="+251 9XX XXX XXX" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">{t.contact?.message || "Message or Inquiry"} *</label>
                  <textarea 
                    name="message" 
                    required 
                    rows={5} 
                    placeholder="Tell us about your event vision, partnership ideas, or enrollment questions..." 
                    value={formData.message} 
                    onChange={handleChange} 
                    className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all placeholder:text-white/30 resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full py-5 rounded-2xl bg-[#D4AF37] hover:bg-[#F5BD42] text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#D4AF37]/25 hover:scale-[1.01]"
                >
                  <FaWhatsapp size={18} />
                  <span>{isSubmitting ? "Opening WhatsApp..." : (t.contact?.send || "Send Message Via WhatsApp")}</span>
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
