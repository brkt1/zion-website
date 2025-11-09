import { useState } from "react";
import { FaEnvelope, FaInstagram, FaMapMarkerAlt, FaPhone, FaTelegram, FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { ErrorState } from "../Components/ui/ErrorState";
import { useContactInfo } from "../hooks/useApi";
import { useReCaptcha } from "../hooks/useReCaptcha";

const Contact = () => {
  const { contactInfo, isError, mutate: refetchContactInfo } = useContactInfo();
  const { verifyCaptcha } = useReCaptcha();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  if (isError || !contactInfo) {
    return (
      <div className="min-h-screen bg-white">
        <ErrorState message="Failed to load contact information. Please try again later." onRetry={() => refetchContactInfo()} />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // SECURITY: Verify reCAPTCHA (REQUIRED)
      const recaptchaToken = await verifyCaptcha('contact_form');
      
      if (!recaptchaToken) {
        setSubmitStatus("error");
        setIsSubmitting(false);
        // Show user-friendly error message
        alert(
          '⚠️ Security Verification Required\n\n' +
          'Unable to complete security verification. Please:\n' +
          '1. Refresh the page\n' +
          '2. Ensure JavaScript is enabled\n' +
          '3. Try again'
        );
        setTimeout(() => setSubmitStatus("idle"), 5000);
        return;
      }
      
      // Format the message with form data
      const whatsappMessage = `Hello! I'm ${formData.name}.\n\n` +
        `Email: ${formData.email}\n` +
        (formData.phone ? `Phone: ${formData.phone}\n` : '') +
        `\nMessage:\n${formData.message}`;
      
      // Create WhatsApp URL (phone number without + or spaces)
      const phoneNumber = contactInfo?.phone?.replace(/\D/g, '') || "251978639887";
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
      // Reset form and show success message
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
      
      setTimeout(() => setSubmitStatus("idle"), 5000);
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

  // Icon mapping
  const iconMap: { [key: string]: any } = {
    email: FaEnvelope,
    phone: FaPhone,
    location: FaMapMarkerAlt,
    instagram: FaInstagram,
    telegram: FaTelegram,
    tiktok: FaTiktok,
    youtube: FaYoutube,
  };

  const contactInfoItems = [
    {
      number: "01",
      icon: FaMapMarkerAlt,
      title: "Office Location",
      content: contactInfo.location || "Addis Ababa, Ethiopia",
      link: null,
    },
    {
      number: "02",
      icon: FaEnvelope,
      title: "Email",
      content: contactInfo.email || "bereketyosef49@gmail.com",
      link: `mailto:${contactInfo.email || "bereketyosef49@gmail.com"}`,
    },
    {
      number: "03",
      icon: FaPhone,
      title: "Phone",
      content: contactInfo.phoneFormatted || contactInfo.phone || "+251 978 639 887",
      link: `tel:${contactInfo.phone?.replace(/\D/g, '') || '251978639887'}`,
    },
  ];

  const socialLinks = contactInfo.socialLinks?.map(link => {
    const Icon = iconMap[link.platform.toLowerCase()] || FaInstagram;
    const gradients: { [key: string]: string } = {
      instagram: "linear-gradient(135deg, #E4405F 0%, #833AB4 100%)",
      telegram: "linear-gradient(135deg, #0088cc 0%, #006699 100%)",
      tiktok: "linear-gradient(135deg, #000000 0%, #333333 100%)",
      youtube: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
    };
    return {
      icon: Icon,
      href: link.url,
      label: link.platform,
      gradient: gradients[link.platform.toLowerCase()] || "linear-gradient(135deg, #E4405F 0%, #833AB4 100%)",
    };
  }) || [
    { icon: FaInstagram, href: "https://instagram.com/yenege", label: "Instagram", gradient: "linear-gradient(135deg, #E4405F 0%, #833AB4 100%)" },
    { icon: FaTelegram, href: "https://t.me/yenege", label: "Telegram", gradient: "linear-gradient(135deg, #0088cc 0%, #006699 100%)" },
    { icon: FaTiktok, href: "https://tiktok.com/@yenege", label: "TikTok", gradient: "linear-gradient(135deg, #000000 0%, #333333 100%)" },
    { icon: FaYoutube, href: "https://youtube.com/@yenege", label: "YouTube", gradient: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div>
            <div className="mb-8 md:mb-12">
              <h1 
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Get in Touch
              </h1>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
                Have questions, suggestions, or want to collaborate? Reach out to us through any of the channels below.
              </p>
            </div>

            <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
              {contactInfoItems.map((info, index) => {
                const Icon = info.icon;
                const content = info.link ? (
                  <a 
                    href={info.link} 
                    className="text-gray-700 hover:text-[#FF6F5E] transition-colors duration-300"
                  >
                    {info.content}
                  </a>
                ) : (
                  <p className="text-gray-700">{info.content}</p>
                );

                return (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 transition-all duration-700 border border-gray-100 hover:border-transparent"
                    style={{
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)",
                      boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
                    }}
                    onMouseEnter={(e) => {
                      if (window.innerWidth >= 768) {
                        e.currentTarget.style.transform = "translateX(8px)";
                        e.currentTarget.style.boxShadow = "0 20px 40px rgba(255, 111, 94, 0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.boxShadow = "0 4px 24px rgba(0, 0, 0, 0.06)";
                    }}
                  >
                    {/* Abstract shape background */}
                    <div 
                      className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(255, 212, 71, 0.3) 0%, rgba(255, 111, 94, 0.3) 100%)",
                        transform: "translate(30%, -30%)",
                      }}
                    ></div>

                    {/* Number indicator */}
                    <div className="absolute top-4 left-4 md:top-6 md:left-6">
                      <div 
                        className="text-3xl md:text-4xl font-black opacity-5 group-hover:opacity-10 transition-opacity duration-700"
                        style={{
                          background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          lineHeight: 1,
                        }}
                      >
                        {info.number}
                      </div>
                    </div>

                    <div className="relative z-10 flex items-start gap-4 md:gap-6 pt-6 md:pt-8">
                      <div 
                        className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                        style={{
                          background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                          boxShadow: "0 4px 15px rgba(255, 111, 94, 0.3)",
                        }}
                      >
                        <Icon className="text-[#1C2951] text-lg md:text-xl" />
                      </div>
                      <div className="flex-grow">
                        <h3 
                          className="font-bold text-gray-900 mb-2 text-base md:text-lg"
                          style={{
                            background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                        >
                          {info.title}
                        </h3>
                        <div className="text-sm md:text-base">
                          {content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Social Media */}
            <div>
              <h3 
                className="font-bold text-gray-900 mb-4 md:mb-6 text-lg md:text-xl"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Follow Us
              </h3>
              <div className="flex gap-3 md:gap-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-white transition-all duration-300 overflow-hidden"
                      style={{
                        background: social.gradient,
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                      }}
                      onMouseEnter={(e) => {
                        if (window.innerWidth >= 768) {
                          e.currentTarget.style.transform = "translateY(-4px) scale(1.1)";
                          e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.3)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
                      }}
                      aria-label={social.label}
                    >
                      <Icon className="text-lg md:text-xl relative z-10" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="group relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 border border-gray-100 transition-all duration-700"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
            }}
            onMouseEnter={(e) => {
              if (window.innerWidth >= 768) {
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(255, 111, 94, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(0, 0, 0, 0.06)";
            }}
          >
            {/* Abstract shape background */}
            <div 
              className="absolute top-0 right-0 w-40 h-40 md:w-64 md:h-64 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
              style={{
                background: "linear-gradient(135deg, rgba(255, 212, 71, 0.2) 0%, rgba(255, 111, 94, 0.2) 100%)",
                transform: "translate(30%, -30%)",
              }}
            ></div>

            <div className="relative z-10">
              <div 
                className="h-1 w-16 md:w-20 mb-6 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Send us a Message
              </h2>
              
              {submitStatus === "success" && (
                <div className="mb-6 p-4 rounded-xl text-sm md:text-base"
                  style={{
                    background: "rgba(34, 197, 94, 0.1)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    color: "#16a34a",
                  }}
                >
                  Opening WhatsApp... If it didn't open, please check your browser settings.
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mb-6 p-4 rounded-xl text-sm md:text-base"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#dc2626",
                  }}
                >
                  Something went wrong. Please try again or contact us directly.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6F5E] focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6F5E] focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6F5E] focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="+251 9XX XXX XXX"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6F5E] focus:border-transparent resize-none transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="Tell us what's on your mind..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group w-full py-3 md:py-4 rounded-full font-semibold transition-all duration-500 relative overflow-hidden text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  style={{
                    background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                    boxShadow: "0 4px 20px rgba(37, 211, 102, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    if (window.innerWidth >= 768 && !isSubmitting) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 30px rgba(37, 211, 102, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(37, 211, 102, 0.3)";
                  }}
                >
                  <span className="relative z-10 inline-flex items-center justify-center">
                    {isSubmitting ? (
                      <>
                        Opening WhatsApp...
                      </>
                    ) : (
                      <>
                        <FaWhatsapp className="mr-2 md:mr-3 relative z-10" size={18} />
                        Send via WhatsApp
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

