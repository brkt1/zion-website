import { useEffect, useState } from "react";
import { 
  FaArrowRight, FaChartLine, FaCheckCircle, FaClipboardList, 
  FaGavel, FaGraduationCap, FaLightbulb, FaMapMarkerAlt, 
  FaRocket, FaShieldAlt, FaTools, FaUsers, FaChevronDown,
  FaPlayCircle, FaCertificate, FaGlobe, FaBrain, FaStar
} from "react-icons/fa";
import { Link } from "react-router-dom";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { BRAND } from "../styles/theme";

const Masterclass = () => {
  const [activeModule, setActiveModule] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Yenege Academy | Masterclass 2024";
    window.scrollTo(0, 0);
  }, []);

  const learningModules = [
    {
      id: "01",
      title: "Understanding the Event Industry",
      description: "Discover how the global event industry works, including the different types of events and the key responsibilities of event managers.",
      icon: <FaUsers />,
      details: ["Market Analysis", "Industry Trends", "Role of Event Manager"]
    },
    {
      id: "02",
      title: "Event Concept Development",
      description: "Learn how to transform an idea into a clear event concept with defined objectives, target audiences, and unique experiences.",
      icon: <FaLightbulb />,
      details: ["Ideation Techniques", "Value Proposition", "Audience Persona"]
    },
    {
      id: "03",
      title: "Event Budgeting & Financial Planning",
      description: "Understand how to create realistic event budgets, manage expenses, generate revenue, and maintain financial control.",
      icon: <FaChartLine />,
      details: ["P&L Management", "Sponsorship Strategy", "Cash Flow"]
    },
    {
      id: "04",
      title: "Venue Selection & Vendor Management",
      description: "Learn how to select the right venues and coordinate vendors such as caterers, decorators, and technical service providers.",
      icon: <FaMapMarkerAlt />,
      details: ["Site Inspection", "Contract Negotiation", "Vendor Sourcing"]
    },
    {
      id: "05",
      title: "Event Marketing & Promotion",
      description: "Discover how to promote events using social media, digital marketing, partnerships, and promotional campaigns.",
      icon: <FaRocket />,
      details: ["Digital Strategy", "Brand Storytelling", "Social Media ROI"]
    },
    {
      id: "06",
      title: "Event Planning & Logistics",
      description: "Understand how to create event timelines, coordinate teams, manage equipment, and ensure smooth operations during the event.",
      icon: <FaClipboardList />,
      details: ["Operation Manuals", "On-site Coordination", "Timeline Design"]
    },
    {
      id: "07",
      title: "Event Technology & Tools",
      description: "Learn how to use modern event tools for registration systems, attendee communication, team collaboration, and event analytics.",
      icon: <FaTools />,
      details: ["RSVP Systems", "Event CRM", "Hybrid Event Tech"]
    },
    {
      id: "08",
      title: "Risk Management & Event Safety",
      description: "Develop strategies to identify risks, create contingency plans, and ensure safety for attendees and staff.",
      icon: <FaShieldAlt />,
      details: ["Health & Safety", "Insurance", "Crowd Control"]
    },
    {
      id: "09",
      title: "Event Marketing Execution",
      description: "Design and implement a real marketing campaign including social media promotions, email invitations, and partnership outreach.",
      icon: <FaCheckCircle />,
      details: ["Live Launch", "PR Management", "Campaign Tracking"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-amber-400 selection:text-black overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        
        :root {
          --brand-gold: #FFD447;
          --brand-coral: #FF6F5E;
          --bg-dark: #020617;
        }

        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Outfit', sans-serif; }

        .text-glow {
          text-shadow: 0 0 30px rgba(255, 212, 71, 0.3);
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-panel:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 212, 71, 0.3);
          transform: translateY(-5px);
        }

        .noise-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          opacity: 0.03;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .hero-gradient {
          background: radial-gradient(circle at 50% -20%, rgba(255, 212, 71, 0.15) 0%, transparent 70%);
        }

        .bento-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 2rem;
          padding: 2.5rem;
          transition: all 0.4s ease;
        }

        .bento-item:hover {
          border-color: var(--brand-gold);
          box-shadow: 0 0 40px rgba(255, 212, 71, 0.1);
        }

        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee {
          animation: marquee 40s linear infinite;
        }

        .gold-pill {
          background: linear-gradient(135deg, rgba(255, 212, 71, 0.1) 0%, transparent 100%);
          border: 1px solid rgba(255, 212, 71, 0.2);
          color: var(--brand-gold);
        }

        @media (max-width: 640px) {
          .font-serif { font-size: clamp(2.2rem, 10vw, 3.5rem) !important; line-height: 1.1 !important; }
          .bento-item { padding: 1.25rem !important; border-radius: 1.25rem !important; }
          section { padding-top: 4rem !important; padding-bottom: 4rem !important; }
          .animate-marquee span { font-size: 1.5rem !important; gap: 0.75rem !important; }
        }
      `}</style>

      <div className="noise-overlay" />

      {/* ── HERO SECTION ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden hero-gradient">
        {/* Abstract floating elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Text Content */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full gold-pill text-[10px] font-black uppercase tracking-[0.3em]">
                <FaGraduationCap className="text-sm" />
                <span>ልዩ ስልጠና · Yenege Academy 2024</span>
              </div>

              <h1 className="font-serif text-[clamp(3.5rem,12vw,9rem)] leading-[0.85] tracking-tighter">
                Learn the Art of <br />
                <span className="italic text-glow" style={{ color: BRAND.gold }}>Event Architecture.</span>
              </h1>

              <p className="text-lg md:text-2xl text-white/40 font-light leading-relaxed max-w-2xl">
                East Africa's most comprehensive event training program. From logistics to execution — we build the next generation of professional event architects.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                <Link
                  to="/masterclass-registration"
                  className="group relative inline-flex items-center gap-4 px-10 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                >
                  Register for the Program
                  <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Image Card */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative group">
                <div className="absolute -inset-4 bg-amber-500/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                  <OptimizedImage 
                    src="/home/becky/.gemini/antigravity/brain/01c2f0d0-3c03-4c66-87da-a509b14b0c73/yenege_academy_hero_1778225045608.png" 
                    alt="Event Academy"
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-10 left-10 right-10 p-6 glass-panel rounded-3xl">
                    <p className="text-amber-400 font-black text-[10px] uppercase tracking-widest mb-1">Limited Slots</p>
                    <h3 className="text-xl font-bold">Enrollment Now Open</h3>
                    <p className="text-white/40 text-xs mt-2 italic font-serif">Cohort 2024 begins this September.</p>
                  </div>
                </div>
              </div>
              
              {/* Vertical sidebrand */}
              <div className="absolute -right-12 top-1/2 -translate-y-1/2 vertical-text text-[10px] font-black uppercase tracking-[1em] text-white/10 select-none">
                YENEGE ACADEMY MASTERCLASS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS MARQUEE ───────────────────────────────────────────────── */}
      <div className="py-12 border-y border-white/5 bg-white/[0.01] overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-16 px-8">
              <span className="flex items-center gap-4 text-4xl font-serif">
                <FaStar className="text-amber-400 text-sm" /> 4.9 STUDENT RATING
              </span>
              <span className="flex items-center gap-4 text-4xl font-serif">
                <FaUsers className="text-amber-400 text-sm" /> 1K+ COMMUNITY
              </span>
              <span className="flex items-center gap-4 text-4xl font-serif">
                <FaCertificate className="text-amber-400 text-sm" /> PROFESSIONAL CERTIFICATION
              </span>
              <span className="flex items-center gap-4 text-4xl font-serif">
                <FaGlobe className="text-amber-400 text-sm" /> GLOBAL NETWORK
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── INTRO SECTION ───────────────────────────────────────────────── */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="font-serif text-[clamp(2.5rem,8vw,5rem)] leading-tight">
              Professional Event Production <br />
              <span className="italic text-white/40">From Idea to Execution.</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-12 text-left">
              <p className="text-lg text-white/40 leading-relaxed font-light">
                Events bring people together, create opportunities, and drive innovation. This program teaches you how professional event planners create successful events from idea to execution.
              </p>
              <p className="text-lg text-white/40 leading-relaxed font-light">
                More importantly, you will design your own event or expo during the course, giving you real-world experience in event planning and management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CURRICULUM SECTION ──────────────────────────────────────────── */}
      <section className="py-32 bg-[#020617] relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <span className="text-amber-500 font-black text-[10px] uppercase tracking-widest">Curriculum Roadmap</span>
              <h2 className="font-serif text-[clamp(3.5rem,10vw,8rem)] leading-none">
                What You <br /><span className="italic text-white/30">Will Master.</span>
              </h2>
            </div>
            <p className="max-w-xs text-white/30 text-sm uppercase tracking-widest border-l border-white/10 pl-8 mb-4">
              A comprehensive system designed to build expertise through nine intensive modules.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningModules.map((module, i) => (
              <div 
                key={i}
                className={`glass-panel p-8 rounded-[2.5rem] cursor-pointer group ${activeModule === i ? 'border-amber-400 bg-white/[0.05]' : ''}`}
                onClick={() => setActiveModule(activeModule === i ? null : i)}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl text-amber-400 group-hover:scale-110 group-hover:rotate-6 transition-all">
                    {module.icon}
                  </div>
                  <span className="font-serif italic text-4xl text-white/5">{module.id}</span>
                </div>
                
                <h3 className="text-2xl font-bold mb-4 group-hover:text-amber-400 transition-colors">{module.title}</h3>
                <p className="text-white/40 text-sm font-light leading-relaxed mb-6">
                  {module.description}
                </p>

                <div className={`space-y-3 overflow-hidden transition-all duration-500 ${activeModule === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {module.details.map((detail, d) => (
                    <div key={d} className="flex items-center gap-3 text-xs text-white/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {detail}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-amber-400 transition-colors">
                  {activeModule === i ? 'Close Details' : 'Explore Module'}
                  <FaChevronDown className={`transition-transform duration-500 ${activeModule === i ? 'rotate-180' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENTO AUDIENCE SECTION ───────────────────────────────────────── */}
      <section className="py-32 relative bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 md:mb-24 space-y-4 md:space-y-6">
            <h2 className="font-serif text-[clamp(3rem,10vw,8rem)]">Who This <span className="italic">Is For</span></h2>
            <p className="text-white/30 uppercase tracking-[0.4em] text-[8px] md:text-[10px] font-black">Open to visionaries from all industries</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            <div className="bento-item md:col-span-2 space-y-4">
              <FaUsers className="text-4xl text-amber-400 mb-6" />
              <h4 className="text-2xl font-bold">Aspiring Professionals</h4>
              <p className="text-white/40 font-light">Students interested in event management careers looking for a strong foundation in the African context.</p>
            </div>
            <div className="bento-item lg:col-span-2 space-y-4 bg-[#FFD447] !text-[#020617]">
              <FaRocket className="text-4xl mb-6" />
              <h4 className="text-2xl font-bold">Entrepreneurs</h4>
              <p className="text-black/60 font-medium">Individuals who want to organize their own expos, conferences, or festivals and build a sustainable business.</p>
            </div>
            <div className="bento-item space-y-4">
              <FaBrain className="text-4xl text-rose-400 mb-6" />
              <h4 className="text-xl font-bold">Marketers</h4>
              <p className="text-white/40 text-sm">Professionals wanting to add experiential marketing and live event planning to their arsenal.</p>
            </div>
            <div className="bento-item space-y-4">
              <FaChartLine className="text-4xl text-blue-400 mb-6" />
              <h4 className="text-xl font-bold">Business Owners</h4>
              <p className="text-white/40 text-sm">Leaders looking to host high-impact corporate events that drive brand loyalty and revenue.</p>
            </div>
            <div className="bento-item md:col-span-2 space-y-4">
              <h4 className="text-2xl font-bold">And Many More...</h4>
              <p className="text-white/40">Community leaders, career changers, and anyone passionate about turning visions into reality.</p>
              <div className="pt-6 flex flex-wrap gap-2">
                {["Public Events", "Weddings", "Concerts", "Corporate"].map(tag => (
                  <span key={tag} className="px-4 py-2 rounded-full border border-white/10 text-[10px] uppercase font-black text-white/30 tracking-widest">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE CAPSTONE SECTION ────────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="glass-panel rounded-[4rem] p-12 md:p-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full -z-1 opacity-20">
              <OptimizedImage 
                src="https://images.unsplash.com/photo-1540575861501-7ad05823c9f5?q=80&w=1200&auto=format&fit=crop" 
                alt="Project"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent" />
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-10">
                <div className="inline-block px-4 py-2 rounded-lg bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest">Capstone Project</div>
                <h2 className="font-serif text-[clamp(3rem,10vw,8rem)] leading-tight">Your <br /><span className="italic text-rose-500">Masterpiece.</span></h2>
                <p className="text-xl text-white/50 font-light leading-relaxed">
                  Throughout the course, you will design your own event or expo. Each module adds a new section until you complete a full professional event plan.
                </p>
                <div className="flex flex-wrap gap-6">
                   <div className="flex items-center gap-3"><FaCheckCircle className="text-amber-400" /> <span className="text-sm font-bold tracking-widest uppercase">Financial Strategy</span></div>
                   <div className="flex items-center gap-3"><FaCheckCircle className="text-amber-400" /> <span className="text-sm font-bold tracking-widest uppercase">Vendor Selection</span></div>
                   <div className="flex items-center gap-3"><FaCheckCircle className="text-amber-400" /> <span className="text-sm font-bold tracking-widest uppercase">Marketing Plan</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-8 rounded-3xl text-center">
                   <FaGavel className="text-4xl text-amber-400 mx-auto mb-4" />
                   <h4 className="font-bold mb-2">Legal Launch</h4>
                   <p className="text-[10px] text-white/30 uppercase tracking-widest">Industry Licensing</p>
                </div>
                <div className="glass-panel p-8 rounded-3xl text-center translate-y-12">
                   <FaPlayCircle className="text-4xl text-rose-400 mx-auto mb-4" />
                   <h4 className="font-bold mb-2">Real Birth</h4>
                   <p className="text-[10px] text-white/30 uppercase tracking-widest">Launch Vision</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="py-48 relative text-center">
        <div className="container mx-auto px-6 space-y-12">
          <FaGraduationCap className="text-6xl text-amber-400 mx-auto mb-8 animate-bounce" />
          <h2 className="font-serif text-[clamp(3.5rem,12vw,9rem)] tracking-tighter">
            Launch Your <br /><span className="italic text-glow" style={{ color: BRAND.gold }}>Vision Today.</span>
          </h2>
          <p className="text-white/40 text-xl md:text-2xl font-light max-w-2xl mx-auto mb-12">
            The next cohort of event architects is being born. Will you be among them?
          </p>
          <Link
            to="/masterclass-registration"
            className="inline-flex items-center gap-6 px-16 py-8 bg-amber-400 text-black rounded-full font-black text-sm uppercase tracking-[0.3em] hover:scale-110 transition-transform shadow-[0_30px_100px_rgba(255,212,71,0.2)]"
          >
            Register for the Program
            <FaArrowRight />
          </Link>
          <div className="pt-12">
            <span className="text-[10px] font-black text-white/10 uppercase tracking-[1em]">YENEGE ACADEMY 2024</span>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Masterclass;
