import { useState } from "react";
import { FaBriefcase, FaHandsHelping, FaSpinner } from "react-icons/fa";
import { ErrorState } from "../Components/ui/ErrorState";
import { useContactInfo } from "../hooks/useApi";
import { adminApi } from "../services/adminApi";

const Apply = () => {
  const { contactInfo, isError, mutate: refetchContactInfo } = useContactInfo();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "internship" as "internship" | "volunteer",
    position: "",
    experience: "",
    motivation: "",
    availability: "",
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
      // Save application to database
      await adminApi.applications.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: formData.type,
        position: formData.position || undefined,
        experience: formData.experience || undefined,
        motivation: formData.motivation,
        availability: formData.availability || undefined,
      });

      // Format the message with form data for WhatsApp
      const whatsappMessage = `Hello! I'm ${formData.name}.\n\n` +
        `Application Type: ${formData.type === "internship" ? "Internship" : "Volunteer"}\n` +
        `Email: ${formData.email}\n` +
        `Phone: ${formData.phone}\n` +
        (formData.position ? `Position/Interest: ${formData.position}\n` : '') +
        (formData.experience ? `Experience: ${formData.experience}\n` : '') +
        (formData.availability ? `Availability: ${formData.availability}\n` : '') +
        `\nMotivation:\n${formData.motivation}`;
      
      // Create WhatsApp URL (phone number without + or spaces)
      const phoneNumber = contactInfo?.phone?.replace(/\D/g, '') || "251978639887";
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
      // Reset form and show success message
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ 
        name: "", 
        email: "", 
        phone: "", 
        type: "internship",
        position: "",
        experience: "",
        motivation: "",
        availability: "",
      });
      
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus("error");
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-block mb-4 md:mb-6">
              <div 
                className="h-1 w-16 md:w-20 mx-auto mb-3 md:mb-4 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
            </div>
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight text-gray-900"
            >
              Join Our Team
            </h1>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              We're always looking for passionate individuals to join us as interns or volunteers. Be part of creating amazing experiences!
            </p>
          </div>

          {/* Application Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "internship" })}
              className={`group relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 transition-all duration-700 border-2 ${
                formData.type === "internship"
                  ? "border-[#FF6F5E]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={{
                background: formData.type === "internship"
                  ? "linear-gradient(135deg, rgba(255, 212, 71, 0.15) 0%, rgba(255, 111, 94, 0.15) 100%)"
                  : "white",
                boxShadow: formData.type === "internship"
                  ? "0 8px 30px rgba(255, 111, 94, 0.25)"
                  : "0 4px 20px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div className="relative z-10">
                <div 
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    formData.type === "internship" ? "scale-110" : ""
                  }`}
                  style={{
                    background: formData.type === "internship"
                      ? "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)"
                      : "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                  }}
                >
                  <FaBriefcase 
                    size={28} 
                    className={formData.type === "internship" ? "text-white" : "text-gray-600"}
                  />
                </div>
                <h3 
                  className={`text-xl md:text-2xl font-bold mb-2 ${
                    formData.type === "internship" ? "text-gray-900" : "text-gray-600"
                  }`}
                >
                  Internship
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Gain valuable experience and learn from industry professionals
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "volunteer" })}
              className={`group relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 transition-all duration-700 border-2 ${
                formData.type === "volunteer"
                  ? "border-[#FF6F5E]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={{
                background: formData.type === "volunteer"
                  ? "linear-gradient(135deg, rgba(255, 212, 71, 0.15) 0%, rgba(255, 111, 94, 0.15) 100%)"
                  : "white",
                boxShadow: formData.type === "volunteer"
                  ? "0 8px 30px rgba(255, 111, 94, 0.25)"
                  : "0 4px 20px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div className="relative z-10">
                <div 
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    formData.type === "volunteer" ? "scale-110" : ""
                  }`}
                  style={{
                    background: formData.type === "volunteer"
                      ? "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)"
                      : "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                  }}
                >
                  <FaHandsHelping 
                    size={28} 
                    className={formData.type === "volunteer" ? "text-white" : "text-gray-600"}
                  />
                </div>
                <h3 
                  className={`text-xl md:text-2xl font-bold mb-2 ${
                    formData.type === "volunteer" ? "text-gray-900" : "text-gray-600"
                  }`}
                >
                  Volunteer
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Make a difference and contribute to our community initiatives
                </p>
              </div>
            </button>
          </div>

          {/* Application Form */}
          <div className="group relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 bg-white border border-gray-200 transition-all duration-700 shadow-lg"
            onMouseEnter={(e) => {
              if (window.innerWidth >= 768) {
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(255, 111, 94, 0.15)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(0, 0, 0, 0.08)";
            }}
          >
            {/* Light decorative background */}
            <div 
              className="absolute top-0 right-0 w-40 h-40 md:w-64 md:h-64 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-700 blur-3xl"
              style={{
                background: "linear-gradient(135deg, rgba(255, 212, 71, 0.3) 0%, rgba(255, 111, 94, 0.3) 100%)",
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
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 tracking-tight text-gray-900">
                Application Form
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6F5E] focus:border-[#FF6F5E] transition-all duration-300 bg-white"
                      placeholder="Your full name"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6F5E] focus:border-[#FF6F5E] transition-all duration-300 bg-white"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6F5E] focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="+251 9XX XXX XXX"
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-semibold text-gray-700 mb-2">
                    Position / Area of Interest
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6F5E] focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="e.g., Marketing, Event Planning, Social Media, etc."
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-semibold text-gray-700 mb-2">
                    Relevant Experience
                  </label>
                  <textarea
                    id="experience"
                    name="experience"
                    rows={3}
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6F5E] focus:border-[#FF6F5E] resize-none transition-all duration-300 bg-white"
                    placeholder="Tell us about your relevant experience, skills, or education..."
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="availability" className="block text-sm font-semibold text-gray-700 mb-2">
                    Availability
                  </label>
                  <input
                    type="text"
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6F5E] focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="e.g., Full-time, Part-time, Weekends only, etc."
                  />
                </div>

                <div>
                  <label htmlFor="motivation" className="block text-sm font-semibold text-gray-700 mb-2">
                    Why do you want to join us? *
                  </label>
                  <textarea
                    id="motivation"
                    name="motivation"
                    required
                    rows={6}
                    value={formData.motivation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6F5E] focus:border-[#FF6F5E] resize-none transition-all duration-300 bg-white"
                    placeholder="Tell us what motivates you and why you're interested in this opportunity..."
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
                        <FaSpinner className="animate-spin mr-2" />
                        Opening WhatsApp...
                      </>
                    ) : (
                      <>
                        Submit Application via WhatsApp
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

export default Apply;

