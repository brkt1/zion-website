import { FaArrowRight, FaChartLine, FaCheckCircle, FaClipboardList, FaGavel, FaGraduationCap, FaLightbulb, FaMapMarkerAlt, FaRocket, FaShieldAlt, FaTools, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { BRAND, GRADIENT } from "../styles/theme";

const Masterclass = () => {
  const learningModules = [
    {
      title: "Understanding the Event Industry",
      description: "Discover how the global event industry works, including the different types of events and the key responsibilities of event managers.",
      icon: <FaUsers />,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Event Concept Development",
      description: "Learn how to transform an idea into a clear event concept with defined objectives, target audiences, and unique experiences.",
      icon: <FaLightbulb />,
      color: "bg-amber-50 text-amber-600"
    },
    {
      title: "Event Budgeting & Financial Planning",
      description: "Understand how to create realistic event budgets, manage expenses, generate revenue, and maintain financial control.",
      icon: <FaChartLine />,
      color: "bg-green-50 text-green-600"
    },
    {
      title: "Venue Selection & Vendor Management",
      description: "Learn how to select the right venues and coordinate vendors such as caterers, decorators, and technical service providers.",
      icon: <FaMapMarkerAlt />,
      color: "bg-rose-50 text-rose-600"
    },
    {
      title: "Event Marketing & Promotion",
      description: "Discover how to promote events using social media, digital marketing, partnerships, and promotional campaigns.",
      icon: <FaRocket />,
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Event Planning & Logistics",
      description: "Understand how to create event timelines, coordinate teams, manage equipment, and ensure smooth operations during the event.",
      icon: <FaClipboardList />,
      color: "bg-indigo-50 text-indigo-600"
    },
    {
      title: "Event Technology & Tools",
      description: "Learn how to use modern event tools for registration systems, attendee communication, team collaboration, and event analytics.",
      icon: <FaTools />,
      color: "bg-cyan-50 text-cyan-600"
    },
    {
      title: "Risk Management & Event Safety",
      description: "Develop strategies to identify risks, create contingency plans, and ensure safety for attendees and staff.",
      icon: <FaShieldAlt />,
      color: "bg-orange-50 text-orange-600"
    },
    {
      title: "Event Marketing Execution",
      description: "Design and implement a real marketing campaign including social media promotions, email invitations, and partnership outreach.",
      icon: <FaCheckCircle />,
      color: "bg-emerald-50 text-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap');

        .noise-bk {
          position: absolute;
          inset: 0;
          opacity: 0.2;
          pointer-events: none;
          background: linear-gradient(to bottom, transparent, #0F172A), 
                      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          z-index: 1;
        }

        .sidebrand {
          position: absolute;
          right: 40px;
          top: 50%;
          transform: translateY(-50%) rotate(90deg);
          transform-origin: right center;
          font-family: 'Manrope', sans-serif;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1em;
          color: rgba(255, 212, 71, 0.1);
          text-transform: uppercase;
          pointer-events: none;
          z-index: 10;
          white-space: nowrap;
        }

        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
        
        .text-gold-gradient {
          background: ${GRADIENT.brand};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .glass-card {
           background: rgba(255,255,255,0.02);
           border: 1px solid rgba(255,255,255,0.08);
           backdrop-filter: blur(20px);
           box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.3);
        }
        
        .glow-button {
          background: ${BRAND.gold};
          color: ${BRAND.primary};
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .glow-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(255, 212, 71, 0.3);
          filter: brightness(1.1);
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .sidebrand { display: none; }
        }
      `}</style>

      {/* Minimalist Premium Hero */}
      <section className="relative pt-24 pb-16 md:pt-48 md:pb-40 bg-[#0F172A] overflow-hidden">
        {/* Creative Layers */}
        <div 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            fontSize: 'max(25vw, 400px)',
            fontWeight: 900,
            fontFamily: "'Playfair Display', serif",
            color: 'rgba(255, 212, 71, 0.02)', 
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 0,
            userSelect: 'none'
          }}
        >
          ACADEMY
        </div>
        <div className="noise-bk" />
        <div className="sidebrand">ZION ACADEMY 2024</div>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(255,212,71,0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1 }} />

        <div className="container mx-auto px-6 text-center">
          <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
            <div className="flex flex-col items-center">
              <span className="text-amber-500 font-black tracking-[0.3em] md:tracking-[0.5em] text-[8px] md:text-[10px] uppercase mb-4 md:mb-6">
                E-Learning Program
              </span>
              <div className="h-px w-8 md:w-12 bg-amber-500/30" />
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl lg:text-9xl text-white tracking-tighter leading-[0.95] md:leading-[0.9] mb-8 md:mb-12">
              Master Event Planning <br />
              <span className="italic text-gold-gradient">& Launch Your Own Expo</span>
            </h1>

            <p className="text-lg md:text-2xl text-white/40 font-light leading-relaxed max-w-3xl mx-auto mb-10 md:mb-16">
              Learn how to design, plan, and legally launch professional events. <br className="hidden md:block" />
              From idea to execution, turn your vision into a real-world experience.
            </p>

            <div className="flex flex-col items-center gap-6 md:gap-8">
              <Link
                to="/masterclass-registration" 
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-10 md:px-16 py-5 md:py-6 overflow-hidden rounded-full border border-white/20 transition-all duration-500 hover:bg-white"
              >
                <span className="relative z-10 text-white font-black text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] uppercase group-hover:text-[#0F172A] transition-colors duration-500">
                  Register for the Program
                </span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>

              <div className="flex items-center gap-4">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-[#E4E821]" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/20">
                  Limited Enrollment
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 mt-20 md:mt-32">
          <div className="aspect-[4/3] md:aspect-[21/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden luxury-border-light shadow-2xl relative group">
            <OptimizedImage 
              src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1920&auto=format&fit=crop" 
              alt="Professional Event Production" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* Intro Text Section */}
      <section className="py-24 bg-[#0F172A] relative overflow-hidden">
        <div className="noise-bk" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <div className="space-y-8">
                <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
                  From Idea to <span className="italic">Execution.</span>
                </h2>
                <p className="text-lg text-white/40 leading-relaxed font-light">
                  Events bring people together, create opportunities, and drive innovation. From business expos and conferences to festivals and networking events, successful events require careful planning, creative ideas, and strong coordination.
                </p>
                <div className="h-1 w-20 bg-[#E4E821] rounded-full" />
              </div>
              <div className="space-y-8 pt-4">
                <p className="text-lg text-white/40 leading-relaxed font-light">
                  This program teaches you how professional event planners create successful events from idea to execution. More importantly, you will design your own event or expo during the course, giving you real-world experience in event planning and management.
                </p>
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-sm text-[#E4E821]">
                    <FaRocket />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Hands-on Experience</h4>
                    <p className="text-sm text-white/40">Apply everything you learn to your own project.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-32 relative overflow-hidden bg-[#0F172A]">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="flex-1 space-y-10 text-white">
                <div className="inline-block px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[#E4E821] font-black text-[10px] uppercase tracking-[0.3em]">
                  Program Benefits
                </div>
                <h2 className="font-serif text-5xl md:text-7xl leading-tight">
                  Why Join <br /><span className="italic text-[#FF6F5E]">This Program?</span>
                </h2>
                <p className="text-xl text-gray-400 font-light leading-relaxed max-w-xl">
                  This is not just a theoretical course. It is a hands-on learning experience where you will apply everything you learn to your own event project.
                </p>
                
                <div className="grid gap-6">
                  {[
                    "Learn the fundamentals of the event industry",
                    "Develop a professional event concept",
                    "Plan budgets and manage financial resources",
                    "Select venues and manage vendors",
                    "Create marketing campaigns that attract attendees",
                    "Plan logistics and event operations",
                    "Use modern event technology tools",
                    "Prepare risk management and safety strategies"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center transition-colors group-hover:border-amber-400">
                        <FaCheckCircle className="text-white/20 text-xs group-hover:text-amber-400" />
                      </div>
                      <span className="text-gray-300 font-light group-hover:text-white transition-colors">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 w-full max-w-xl">
                <div className="relative group">
                  <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl relative">
                    <OptimizedImage 
                      src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop" 
                      alt="Industry Standard Portfolio" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 opacity-60" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C2951] to-transparent opacity-80" />
                    <div className="absolute bottom-12 left-12 right-12 p-8 backdrop-blur-md bg-white/5 rounded-3xl border border-white/10">
                      <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">Outcome</p>
                      <h3 className="text-2xl font-bold text-white">Industry Standard Portfolio</h3>
                      <p className="text-white/40 text-sm mt-2">Design a professional event plan ready for the real world.</p>
                    </div>
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E4E821] rounded-full flex flex-col items-center justify-center text-center p-6 shadow-2xl float-animation">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] mb-1">Success Rate</span>
                    <span className="text-3xl font-black text-[#0F172A]">100%</span>
                    <span className="text-[8px] font-bold text-[#0F172A]/60 uppercase tracking-tighter mt-1">Completion Goal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid Section */}
      <section className="py-20 md:py-32 bg-[#0F172A] relative overflow-hidden">
        <div className="noise-bk" />
        <div 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%) rotate(-5deg)',
            fontSize: 'max(20vw, 300px)',
            fontWeight: 900,
            fontFamily: "'Playfair Display', serif",
            color: 'rgba(255, 212, 71, 0.01)', 
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 0,
            userSelect: 'none'
          }}
        >
          CURRICULUM
        </div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(228,232,33,0.05) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 1 }} />

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-4 px-5 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                 <div className="w-2 h-2 rounded-full bg-[#E4E821] animate-pulse" />
                 <span className="text-white font-black tracking-[0.3em] md:tracking-[0.4em] text-[8px] md:text-[10px] uppercase">Curriculum Roadmap</span>
              </div>
              <h2 className="font-serif text-5xl md:text-8xl text-white tracking-tighter leading-[1.1] md:leading-[0.85] mb-6">
                What You <br /><span className="italic text-gold-gradient">Will Master.</span>
              </h2>
            </div>
            <p className="text-white/40 text-lg md:text-xl font-light max-w-sm leading-relaxed md:text-right md:border-r-2 md:border-[#E4E821]/20 md:pr-8 md:mb-4">
              A comprehensive system designed to build your expertise through nine intensive modules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 max-w-7xl mx-auto">
            {learningModules.map((module, i) => (
              <div 
                key={i} 
                className="group relative p-10 rounded-[3rem] bg-white/5 border border-white/10 transition-all duration-700 hover:shadow-[0_40px_100px_-20px_rgba(255,212,71,0.2)] hover:-translate-y-4 hover:border-[#E4E821]"
              >
                {/* Number Watermark */}
                <div className="absolute top-10 right-10 font-serif italic text-6xl text-white opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                  {i + 1}
                </div>
                
                <div className="relative space-y-10">
                  <div className={`w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-2xl transition-all duration-700 group-hover:rotate-[10deg] group-hover:scale-110 text-[#E4E821]`}>
                    {module.icon}
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white tracking-tight leading-tight group-hover:text-[#E4E821] transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-white/40 leading-relaxed font-light text-base md:text-lg">
                      {module.description}
                    </p>
                  </div>
                  
                  <div className="pt-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Explore Module</span>
                    <div className="h-px w-10 bg-amber-500/50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The "Total Outcome" Mega Section */}
      <section className="py-24 bg-[#0F172A] text-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-stretch">
            {/* Project Box */}
            <div className="lg:w-7/12 bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 md:p-16 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="inline-block px-4 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest mb-8">Capstone Project</div>
                <h2 className="font-serif text-5xl md:text-7xl mb-8 leading-tight">
                  Your <br /><span className="italic text-[#FF6F5E]">Masterpiece.</span>
                </h2>
                <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed mb-12">
                   Throughout the course, you will design your own event or expo. Each module adds a new section until you complete a full professional event plan.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Financial Strategy",
                    "Vendor selection",
                    "Marketing plan",
                    "Risk management"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <FaCheckCircle className="text-amber-500" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-12 group relative rounded-[2rem] overflow-hidden aspect-[16/7] border border-white/10">
                  <OptimizedImage 
                    src="https://images.unsplash.com/photo-1540575861501-7ad05823c9f5?q=80&w=800&auto=format&fit=crop" 
                    alt="Success" 
                    className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-8">
                     <p className="font-black text-[10px] uppercase tracking-widest text-amber-500">Portfolio Ready</p>
                  </div>
              </div>
            </div>

            {/* Legal / Benefit Box */}
            <div className="lg:w-5/12 flex flex-col gap-6">
               <div className="flex-1 bg-[#E4E821] rounded-[3rem] p-10 md:p-12 text-[#0F172A] relative overflow-hidden group">
                  <div className="relative z-10">
                    <FaGavel className="text-4xl mb-6 opacity-40" />
                    <h3 className="text-3xl font-black mb-4 tracking-tight">Legal Launch.</h3>
                    <p className="font-medium text-lg mb-8 leading-snug">
                       We help you legally license and launch your event. This isn't just theory—it's birth.
                    </p>
                  </div>
                   <FaRocket className="absolute -bottom-4 -right-4 text-[120px] opacity-10 -rotate-12 transition-transform group-hover:translate-x-4 group-hover:-translate-y-4" />
               </div>
               
               <div className="flex-1 bg-white/5 border border-white/10 p-10 md:p-12 rounded-[3rem] text-white relative">
                  <h3 className="text-2xl font-black mb-6">Why Us?</h3>
                  <div className="space-y-4">
                    {["Hands-on learning", "Industry licensing", "Global network"].map((item, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2">
                         <span className="font-bold uppercase text-[10px] tracking-widest text-white/40">{item}</span>
                         <FaArrowRight className="text-[#E4E821]" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-4">
                     <div className="text-4xl font-serif italic text-gold-gradient">Success 100%</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 md:py-24 bg-[#0F172A] relative overflow-hidden">
        <div className="noise-bk" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <h2 className="font-serif text-4xl md:text-6xl text-white mb-6 tracking-tight">Who This Program <span className="italic">Is For</span></h2>
            <div className="h-1 w-20 bg-[#E4E821] mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 max-w-6xl mx-auto">
            {[
              { title: "Aspiring Professionals", text: "Students interested in event management careers looking for a strong foundation." },
              { title: "Entrepreneurs", text: "Individuals who want to organize their own expos, conferences, or festivals." },
              { title: "Marketers", text: "Professionals wanting to add event planning to their service offerings." },
              { title: "Business Owners", text: "Leaders looking to host high-impact corporate events for their brands." },
              { title: "Community Leaders", text: "Organizers planning impactful public or social events." },
              { title: "Career Changers", text: "Anyone passionate about event planning looking for a professional start." }
            ].map((card, i) => (
              <div key={i} className="bg-white/5 p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-white/10 transition-all hover:shadow-xl group">
                <div className="w-12 h-1 mr-auto mb-6 bg-white/10 group-hover:bg-[#E4E821] transition-all group-hover:w-20 rounded-full" />
                <h4 className="font-bold text-white mb-4 text-xl tracking-tight">{card.title}</h4>
                <p className="text-white/40 text-sm font-light leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 md:py-32 bg-[#0F172A] relative overflow-hidden">
        <div className="noise-bk" />
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-10 md:space-y-12 relative z-10">
            <div className="w-16 md:w-20 h-16 md:h-20 bg-[#E4E821] rounded-2xl md:rounded-3xl mx-auto flex items-center justify-center text-[#0F172A] text-2xl md:text-3xl shadow-xl shadow-amber-500/20 mb-8 md:mb-12">
              <FaGraduationCap />
            </div>
            <h2 className="font-serif text-4xl sm:text-6xl md:text-8xl text-white tracking-tighter leading-tight mb-8">
              Start Your Event <br /><span className="italic text-gold-gradient">Planning Journey.</span>
            </h2>
            <p className="text-lg md:text-2xl text-white/40 font-light leading-relaxed max-w-2xl mx-auto">
              If you want to gain practical event management skills and learn how to launch professional events, this program is the perfect place to begin.
            </p>
            
            <div className="pt-8">
              <Link 
                to="/masterclass-registration" 
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-10 md:px-16 py-5 md:py-7 overflow-hidden rounded-full border border-white/20 transition-all duration-500 hover:bg-white"
              >
                <span className="relative z-10 text-white font-black text-[10px] md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase group-hover:text-[#0F172A] transition-colors duration-500">
                  Register for the Program <FaArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>
              <p className="mt-8 text-white/20 text-[8px] md:text-xs font-black uppercase tracking-[0.4em]">Launch Your Vision Today</p>
            </div>
          </div>
          
          {/* Abstract background shapes */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 md:w-96 h-64 md:h-96 bg-amber-500/5 rounded-full blur-[80px] md:blur-[100px] -z-1" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 md:w-96 h-64 md:h-96 bg-rose-500/5 rounded-full blur-[80px] md:blur-[100px] -z-1" />
        </div>
      </section>
      
      {/* Scroll to top nudge */}
      <div className="pb-12 text-center bg-[#0F172A]">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-white/20 hover:text-[#E4E821] transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-4 mx-auto"
        >
          <div className="h-px w-8 bg-white/5" />
          Back to Top
          <div className="h-px w-8 bg-white/5" />
        </button>
      </div>
    </div>
  );
};

export default Masterclass;
