import { useEffect, useState } from "react";
import { 
  FaArrowRight, FaChartLine, FaCheck, FaClipboardList, 
  FaCalendarAlt, FaLaptop, FaUsers, FaTrophy, FaGraduationCap,
  FaStar, FaShieldAlt, FaChevronDown, FaLock, FaCreditCard,
  FaPlayCircle, FaAward, FaInfinity, FaCheckCircle, FaUserCheck
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Masterclass = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    document.title = "Yenege Academy | Master Event Leadership";
    window.scrollTo(0, 0);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const whyStudyUs = [
    {
      title: "Accredited Certificate",
      desc: "Earn industry-recognized credentials to boost your CV, LinkedIn profile, and job prospects.",
      icon: <FaAward className="text-3xl text-[#FFD447]" />
    },
    {
      title: "Real-World Case Studies",
      desc: "Work on actual event scenarios, budgeting templates, vendor management, and crisis control.",
      icon: <FaClipboardList className="text-3xl text-[#FF6F5E]" />
    },
    {
      title: "Executive Networking",
      desc: "Connect with peers, event organizers, and hiring managers in exclusive community forums.",
      icon: <FaUsers className="text-3xl text-[#7B5CFF]" />
    },
    {
      title: "Instant Secure Access",
      desc: "Pay easily via Telebirr or CBE Bank and gain instant access to your course dashboard.",
      icon: <FaLock className="text-3xl text-[#3CCFCF]" />
    }
  ];

  const faqs = [
    {
      q: "Will I receive an official certificate upon course completion?",
      a: "Yes! Every graduate receives a verified digital certificate from Yenege Academy that you can showcase on LinkedIn, your resume, or print for your portfolio."
    },
    {
      q: "What payment methods are accepted?",
      a: "We support instant local payments via Telebirr, Commercial Bank of Ethiopia (CBE Bank Transfer & CBE Birr), and major cards."
    },
    {
      q: "Are the courses suitable for beginners with no event experience?",
      a: "Absolutely! The program is structured step-by-step to guide complete beginners as well as active event organizers looking to professionalize their execution."
    },
    {
      q: "Can I learn at my own pace or are there fixed schedules?",
      a: "You get flexible options: access self-paced digital modules 24/7 or attend live interactive weekend sessions & in-person practical workshops."
    }
  ];

  const reviews = [
    {
      name: "Selamawit Tadesse",
      role: "Certified Event Architect",
      text: "Yenege Academy changed my perspective on event production. The budgeting templates and real venue drills gave me the confidence to launch my own event agency.",
      rating: 5,
      location: "Addis Ababa"
    },
    {
      name: "Yared Bekele",
      role: "Corporate Event Manager",
      text: "The practical case studies on vendor management and risk control saved our recent expo thousands. Highly recommended for anyone serious about event execution.",
      rating: 5,
      location: "Bole, Addis Ababa"
    },
    {
      name: "Bethlehem Haile",
      role: "Founding Cohort Student",
      text: "Being able to pay with Telebirr and get instant access was super smooth. The executive networking with Addis Ababa's top organizers is priceless.",
      rating: 5,
      location: "Hawassa"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-x-hidden selection:bg-[#FFD447] selection:text-[#1C2951] pb-24">
      
      {/* ── HERO SECTION ────────────────────────────────────────────────── */}
      <section className="relative pt-32 lg:pt-40 pb-20 overflow-hidden">
        {/* Background ambient radial gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-radial from-[#FFD447]/10 via-transparent to-transparent blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-radial from-[#FF6F5E]/10 via-transparent to-transparent blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column Content */}
            <div className="space-y-8">
              
              {/* Pill badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFD447] shadow-[0_0_12px_#FFD447]" />
                <span className="text-[#FFD447] font-black text-xs uppercase tracking-[0.25em]">YENEGE ACADEMY</span>
              </div>
              
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white">
                Elevate Your Career.<br />
                <span className="bg-gradient-to-r from-[#FFD447] via-[#FF6F5E] to-[#7B5CFF] bg-clip-text text-transparent italic">Master Event</span> Leadership.
              </h1>
              
              <p className="text-lg text-slate-300 max-w-xl font-medium leading-relaxed">
                Gain practical, real-world skills from industry experts. Organize high-impact events, lead high-performing teams, and earn accredited certificates to advance your career.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3">
                <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-2">
                  <FaLaptop className="text-[#FFD447]" /> Mixed (Online &amp; Practical)
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-2">
                  <FaShieldAlt className="text-[#FF6F5E]" /> Verified Certificate
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-2">
                  <FaCreditCard className="text-[#3CCFCF]" /> Telebirr &amp; CBE Payment
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link 
                  to="/masterclass-registration" 
                  className="bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] hover:from-[#ffe066] hover:to-[#ff8273] text-[#1C2951] font-black px-8 py-4 rounded-full transition-all shadow-xl shadow-[#FF6F5E]/20 hover:scale-[1.02] flex items-center gap-3 text-sm tracking-wider uppercase"
                >
                  Enroll Now <FaArrowRight />
                </Link>
                <a 
                  href="#courses" 
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-extrabold transition-all text-sm tracking-wider uppercase backdrop-blur-xl hover:border-white/40"
                >
                  Explore Masterclasses
                </a>
              </div>

              {/* Student Trust Stats */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <div className="flex text-[#FFD447] text-sm">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-300">
                  <strong className="text-white text-sm">4.9/5</strong> • Joined by ambitious students across Ethiopia
                </span>
              </div>
            </div>

            {/* Right Card / Media Showcase */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-[550px] aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 shadow-2xl group">
                <img 
                  src="/masterclass_custom_image.png" 
                  alt="Yenege Academy Masterclass" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
                
                {/* Center Play Trailer Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Link 
                    to="/masterclass-registration" 
                    className="w-16 h-16 rounded-full bg-[#FFD447] text-[#1C2951] flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition-transform group-hover:bg-white"
                  >
                    <FaPlayCircle />
                  </Link>
                </div>

                {/* Bottom Overlay Badge */}
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-[#0F172A]/85 backdrop-blur-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Preview Academy Trailer</h4>
                      <p className="text-[10px] font-semibold text-slate-400">HD Quality • Certified Curriculum</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#FFD447]/10 text-[#FFD447] text-[10px] font-black uppercase tracking-wider border border-[#FFD447]/20">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* ── Key Performance Stats Bar ──────────────────────────────────── */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { stat: "98%", label: "Student Satisfaction", desc: "Top-rated academy reviews" },
              { stat: "Mixed", label: "Theory & Practical", desc: "Digital + Live Event Execution" },
              { stat: "Verified", label: "Accredited Certificates", desc: "Boost your CV & LinkedIn" },
              { stat: "24/7", label: "Lifetime Access", desc: "Learn anywhere, anytime" }
            ].map((item, index) => (
              <div key={index} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col gap-1 hover:border-white/20 transition-all">
                <span className="font-heading text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] bg-clip-text text-transparent">{item.stat}</span>
                <span className="font-bold text-sm text-white mt-1">{item.label}</span>
                <span className="text-[11px] text-slate-400 font-medium">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY STUDY WITH US SECTION ───────────────────────────────────── */}
      <section className="py-24 relative bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD447]/10 border border-[#FFD447]/30 text-[#FFD447] text-xs font-extrabold uppercase tracking-widest">
              Why Study With Us
            </div>
            <h2 className="font-heading text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
              Designed to Turn Beginners Into <span className="bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] bg-clip-text text-transparent italic">Industry Leaders</span>
            </h2>
            <p className="text-base text-slate-400 font-medium max-w-2xl mx-auto">
              Everything you need to master event planning, teamwork, and execution in one complete learning environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyStudyUs.map((item, index) => (
              <div key={index} className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-[#FFD447]/40 hover:bg-white/[0.08] transition-all duration-300">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROGRAMS SECTION ──────────────────────────────────── */}
      <section id="courses" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs font-black text-[#FFD447] uppercase tracking-[0.25em] block mb-2">Featured Programs</span>
              <h2 className="font-heading text-4xl font-black text-white">Explore <span className="italic text-gold-gradient">Masterclasses</span></h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Select a course and start your transformation today.</p>
            </div>
            
            <div className="flex gap-3">
              <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300">All Categories</span>
              <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300">All Formats</span>
            </div>
          </div>

          {/* Program Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-[#FFD447]/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#FFD447]/10 text-[#FFD447] text-[10px] font-black uppercase tracking-wider border border-[#FFD447]/20">
                    Master Certification
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400">In-Person &amp; Online</span>
                </div>
                <h3 className="font-heading text-2xl font-black text-white mb-3">Event Architecture &amp; Production Leadership</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
                  Comprehensive 5-step masterclass covering event design, budgeting, vendor negotiation, venue management, and on-ground crisis control.
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-300 mb-6">
                  <div className="flex items-center gap-2"><FaCheck className="text-[#FFD447]" /> Includes Real Event Execution at Major Expo</div>
                  <div className="flex items-center gap-2"><FaCheck className="text-[#FFD447]" /> Accredited Digital Certificate</div>
                  <div className="flex items-center gap-2"><FaCheck className="text-[#FFD447]" /> Telebirr &amp; CBE Payment Supported</div>
                </div>
              </div>

              <Link 
                to="/masterclass-registration" 
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] text-[#1C2951] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
              >
                Enroll Now <FaArrowRight />
              </Link>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-[#FFD447]/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#FF6F5E]/10 text-[#FF6F5E] text-[10px] font-black uppercase tracking-wider border border-[#FF6F5E]/20">
                    Specialized Track
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400">Full Online</span>
                </div>
                <h3 className="font-heading text-2xl font-black text-white mb-3">Event Marketing &amp; Sponsorship Strategy</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
                  Learn how to craft high-converting corporate proposals, secure sponsor partnerships, and drive ticket sales for events across East Africa.
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-300 mb-6">
                  <div className="flex items-center gap-2"><FaCheck className="text-[#FF6F5E]" /> Corporate Sponsorship Deck Templates</div>
                  <div className="flex items-center gap-2"><FaCheck className="text-[#FF6F5E]" /> Lifetime 24/7 Access</div>
                  <div className="flex items-center gap-2"><FaCheck className="text-[#FF6F5E]" /> Accredited Certificate</div>
                </div>
              </div>

              <Link 
                to="/masterclass-registration" 
                className="w-full py-3.5 rounded-xl bg-white/10 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/15"
              >
                Learn More <FaArrowRight />
              </Link>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-[#FFD447]/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#7B5CFF]/10 text-[#7B5CFF] text-[10px] font-black uppercase tracking-wider border border-[#7B5CFF]/20">
                    Executive Workshop
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400">Hybrid</span>
                </div>
                <h3 className="font-heading text-2xl font-black text-white mb-3">Wedding &amp; Social Experience Architecture</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
                  Master luxury wedding logistics, high-end decor coordination, client communication, and seamless ceremony execution.
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-300 mb-6">
                  <div className="flex items-center gap-2"><FaCheck className="text-[#7B5CFF]" /> Hands-on Floral &amp; Stage Design Drills</div>
                  <div className="flex items-center gap-2"><FaCheck className="text-[#7B5CFF]" /> Client Management Worksheets</div>
                  <div className="flex items-center gap-2"><FaCheck className="text-[#7B5CFF]" /> Accredited Certificate</div>
                </div>
              </div>

              <Link 
                to="/masterclass-registration" 
                className="w-full py-3.5 rounded-xl bg-white/10 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/15"
              >
                Learn More <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STUDENT REVIEWS SECTION ─────────────────────────────────────── */}
      <section className="py-24 bg-[#0B0F19] relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-black text-[#FFD447] uppercase tracking-[0.25em] block">Student Reviews</span>
            <h2 className="font-heading text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
              Loved by Students Across <span className="text-[#FFD447] italic">Ethiopia</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex text-[#FFD447] text-sm">
                    {[...Array(rev.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium italic">"{rev.text}"</p>
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#FFD447] text-[#1C2951] font-black flex items-center justify-center text-sm">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white leading-tight">{rev.name}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">{rev.role} • {rev.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS (FAQ) ───────────────────────────── */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-black text-[#FFD447] uppercase tracking-[0.25em] block">Got Questions?</span>
            <h2 className="font-heading text-4xl font-black text-white uppercase tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-xl transition-all">
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left font-bold text-sm md:text-base text-white flex items-center justify-between gap-4 hover:bg-white/5"
                  >
                    <span>{faq.q}</span>
                    <FaChevronDown className={`transition-transform duration-300 text-[#FFD447] ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs md:text-sm text-slate-300 leading-relaxed font-medium border-t border-white/5 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA HERO BANNER ──────────────────────────────────────── */}
      <section className="py-20 relative px-6">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-r from-[#1C2951] via-[#0F172A] to-[#1C2951] border border-white/20 p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD447]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6 relative z-10 max-w-2xl mx-auto">
            <h2 className="font-heading text-4xl md:text-5xl font-black text-white leading-tight">
              Start Learning Today.<br /><span className="text-[#FFD447] italic">Lead Tomorrow.</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
              Join hundreds of students mastering event leadership. Flexible learning, local payment, and certified credentials.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
              <Link 
                to="/masterclass-registration" 
                className="bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] hover:from-[#ffe066] hover:to-[#ff8273] text-[#1C2951] font-black px-10 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#FF6F5E]/20 hover:scale-105 flex items-center gap-3"
              >
                Enroll Now &amp; Get Started <FaArrowRight />
              </Link>
              <Link 
                to="/masterclass-registration" 
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all"
              >
                Already Enrolled? Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Masterclass;
