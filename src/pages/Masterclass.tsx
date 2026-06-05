import { useEffect } from "react";
import { 
  FaArrowRight, FaChartLine, FaCheck, FaClipboardList, 
  FaCalendarAlt, FaLaptop, FaUsers, FaTrophy, FaGraduationCap,
  FaMapMarkerAlt
} from "react-icons/fa";
import { Link } from "react-router-dom";


const Masterclass = () => {
  useEffect(() => {
    document.title = "Yenege Academy | Masterclass";
    window.scrollTo(0, 0);
  }, []);

  const roadmapSteps = [
    {
      id: "01",
      title: "ONLINE FOUNDATION",
      desc: "Learn core concepts of event organizing, marketing, budgeting, logistics & more through interactive online classes.",
      icon: <FaLaptop className="text-3xl text-[#E85D04]" />
    },
    {
      id: "02",
      title: "LIVE SESSIONS & DISCUSSIONS",
      desc: "Join live sessions, group discussions, and Q&A with experts and industry mentors.",
      icon: <FaUsers className="text-3xl text-[#E85D04]" />
    },
    {
      id: "03",
      title: "PRACTICAL ASSIGNMENTS",
      desc: "Work on real-life assignments, case studies and event planning challenges.",
      icon: <FaClipboardList className="text-3xl text-[#E85D04]" />
    },
    {
      id: "04",
      title: "IN-PERSON HANDS-ON WORKSHOPS",
      desc: "Attend in-person workshops, team activities & industry insights.",
      icon: <FaCalendarAlt className="text-3xl text-[#E85D04]" />
    },
    {
      id: "05",
      title: "IN-PERSON REAL EVENT EXECUTION",
      desc: "Apply your skills in real event environments with our team.",
      icon: <FaUsers className="text-3xl text-[#E85D04]" />
    },
    {
      id: "06",
      title: "REFLECTION & GROWTH",
      desc: "Review, evaluate and grow with feedback, networking and future opportunities.",
      icon: <FaTrophy className="text-3xl text-[#E85D04]" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-[#0F172A] font-sans overflow-x-hidden selection:bg-[#E85D04] selection:text-white pb-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Plus+Jakarta+Sans:wght@400..800&display=swap');
        
        .font-heading { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-sans { font-family: 'Outfit', sans-serif; }
        
        .soft-shadow {
          box-shadow: 0 20px 40px rgba(232, 93, 4, 0.08);
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle at right center, rgba(232, 93, 4, 0.1) 0%, transparent 50%);
        }
      `}</style>

      {/* ── HERO SECTION ────────────────────────────────────────────────── */}
      <section className="relative pt-28 lg:pt-36 pb-12 bg-gradient-radial">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8 z-10 relative">
              <div className="flex items-center gap-3">
                <div className="w-8 h-0.5 bg-[#E85D04]"></div>
                <span className="text-[#0F172A] font-bold text-xs uppercase tracking-[0.2em]">The Future of Event Execution</span>
              </div>
              
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-[#0F172A]">
                Learn. Plan. <br className="hidden sm:block" />
                <span className="text-[#E85D04]">Execute.</span> Lead. <br className="hidden sm:block" />
                Create Impact.
              </h1>
              
              <p className="text-lg text-[#0F172A]/70 max-w-lg font-medium leading-relaxed">
                Practical online learning and real-world training for the next generation of event leaders.
              </p>
              


              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link to="/masterclass-registration" className="bg-[#E85D04] hover:bg-[#c94e03] text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-[#E85D04]/30 hover:-translate-y-0.5 flex items-center gap-2">
                  Get Started <FaArrowRight className="text-sm" />
                </Link>
                <Link to="/masterclass-registration" className="bg-white border-2 border-[#E85D04]/20 hover:border-[#E85D04] text-[#0F172A] px-8 py-3 rounded-full font-bold transition-all hover:bg-[#E85D04]/5">
                  Reserve a Spot
                </Link>
              </div>

              {/* Floating feature card */}
              <div className="bg-white/80 backdrop-blur-md border border-[#E85D04]/10 p-4 rounded-2xl flex items-center gap-4 mt-8 max-w-md soft-shadow">
                <div className="w-12 h-12 rounded-full bg-[#E85D04]/10 flex items-center justify-center text-[#E85D04] shrink-0">
                  <FaGraduationCap className="text-xl" />
                </div>
                <p className="text-sm font-medium text-[#0F172A]/80 leading-snug">
                  Learn anytime, anywhere with expert instructors and hands-on real event experience.
                </p>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative lg:h-[600px] flex items-end justify-center lg:justify-end">
              <div className="absolute inset-0 bg-[#E85D04]/5 rounded-full blur-[100px] -z-10"></div>
              <img 
                src="/masterclass_custom_image.png" 
                alt="Yenege Academy Students" 
                className="w-full max-w-[600px] object-contain drop-shadow-2xl z-10 mix-blend-multiply"
              />
            </div>
            
          </div>

          {/* Bottom Features Bar */}
          <div className="mt-16 bg-white border border-[#E85D04]/10 rounded-3xl p-6 lg:p-8 flex flex-wrap lg:flex-nowrap justify-between gap-8 soft-shadow relative z-20">
            <div className="flex items-center gap-4 flex-1 min-w-[200px]">
              <div className="w-12 h-12 rounded-xl bg-[#E85D04]/10 flex items-center justify-center text-[#E85D04]">
                <FaLaptop className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] mb-1">Online Learning</h4>
                <p className="text-xs text-[#0F172A]/60">Access expert-designed courses anytime.</p>
              </div>
            </div>
            
            <div className="w-px bg-[#E85D04]/10 hidden lg:block"></div>
            
            <div className="flex items-center gap-4 flex-1 min-w-[200px]">
              <div className="w-12 h-12 rounded-xl bg-[#E85D04]/10 flex items-center justify-center text-[#E85D04]">
                <FaUsers className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] mb-1">Live Sessions</h4>
                <p className="text-xs text-[#0F172A]/60">Join interactive classes and discussions.</p>
              </div>
            </div>

            <div className="w-px bg-[#E85D04]/10 hidden lg:block"></div>
            
            <div className="flex items-center gap-4 flex-1 min-w-[200px]">
              <div className="w-12 h-12 rounded-xl bg-[#E85D04]/10 flex items-center justify-center text-[#E85D04]">
                <FaCalendarAlt className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] mb-1">Real Event Execution</h4>
                <p className="text-xs text-[#0F172A]/60">Apply your skills in real events and projects.</p>
              </div>
            </div>

            <div className="w-px bg-[#E85D04]/10 hidden lg:block"></div>
            
            <div className="flex items-center gap-4 flex-1 min-w-[200px]">
              <div className="w-12 h-12 rounded-xl bg-[#E85D04]/10 flex items-center justify-center text-[#E85D04]">
                <FaChartLine className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] mb-1">Career Growth</h4>
                <p className="text-xs text-[#0F172A]/60">Build your portfolio and unlock new opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COURSE ROADMAP SECTION ──────────────────────────────────────── */}
      <section className="py-20 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl lg:text-5xl font-black text-[#0F172A] mb-6 uppercase tracking-tight">
              Course Roadmap
            </h2>
            <div className="inline-block bg-[#E85D04] text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider mb-6">
              Online Learning + In-Person Execution
            </div>
            <p className="text-lg text-[#0F172A]/70 font-medium max-w-2xl mx-auto">
              A practical learning journey from knowledge to real event execution!
            </p>
          </div>

          <div className="bg-white border-2 border-[#E85D04]/10 rounded-[2.5rem] p-8 lg:p-12 soft-shadow mb-12">
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="w-12 h-0.5 bg-[#E85D04]/30"></div>
              <h3 className="font-heading text-xl font-bold uppercase tracking-widest text-[#0F172A]">
                Our <span className="text-[#E85D04]">Learning Journey</span>
              </h3>
              <div className="w-12 h-0.5 bg-[#E85D04]/30"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative">
              {roadmapSteps.map((step, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center">
                  {/* Connection arrow (desktop only) */}
                  {idx < roadmapSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-6 right-0 translate-x-1/2 w-8 text-[#E85D04]/30">
                      <FaArrowRight />
                    </div>
                  )}

                  <div className="w-12 h-12 rounded-full bg-[#E85D04] text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md z-10 relative">
                    {step.id}
                  </div>
                  
                  <div className="bg-[#FFFBF7] w-full rounded-2xl p-6 border border-[#E85D04]/10 flex flex-col items-center h-full hover:-translate-y-1 transition-transform">
                    <div className="mb-4">
                      {step.icon}
                    </div>
                    <h4 className="font-bold text-sm mb-3 leading-snug uppercase">{step.title}</h4>
                    <p className="text-xs text-[#0F172A]/60 leading-relaxed">{step.desc}</p>
                    <div className="mt-auto pt-6">
                       <div className="w-12 h-2 rounded-full bg-gray-200/50"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Info Blocks */}
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* What you'll get */}
            <div className="bg-white border-2 border-[#E85D04]/10 rounded-3xl p-8 lg:p-10 soft-shadow flex flex-col sm:flex-row gap-8 items-center relative overflow-hidden">
              <div className="flex-1 space-y-4 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center">
                    <FaTrophy className="text-sm" />
                  </div>
                  <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-[#0F172A]">
                    What You'll <span className="text-[#E85D04]">Get</span>
                  </h3>
                </div>

                {[
                  "Practical skills in Event Organizing & Marketing",
                  "Real event execution experience",
                  "Industry mentorship & networking",
                  "Certificate of Completion",
                  "Access to future opportunities"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <FaCheck className="text-[#E85D04] mt-1 shrink-0" />
                    <span className="text-sm font-medium text-[#0F172A]/80">{item}</span>
                  </div>
                ))}
              </div>
              

              <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#E85D04]/5 rounded-full blur-[50px] -z-0"></div>
            </div>

            {/* Program Highlights */}
            <div className="bg-white border-2 border-[#E85D04]/10 rounded-3xl p-8 lg:p-10 soft-shadow">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center">
                  <FaGraduationCap className="text-sm" />
                </div>
                <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-[#0F172A]">
                  Program <span className="text-[#E85D04]">Highlights</span>
                </h3>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="text-3xl text-[#E85D04]"><FaLaptop /></div>
                  <span className="text-xs font-medium text-[#0F172A]/80">Online<br/>Learning</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="text-3xl text-[#E85D04]"><FaUsers /></div>
                  <span className="text-xs font-medium text-[#0F172A]/80">Live Classes &<br/>Mentorship</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="text-3xl text-[#E85D04]"><FaMapMarkerAlt /></div>
                  <span className="text-xs font-medium text-[#0F172A]/80">In-Person<br/>Workshops</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="text-3xl text-[#E85D04]"><FaCalendarAlt /></div>
                  <span className="text-xs font-medium text-[#0F172A]/80">Real Event<br/>Execution</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="text-3xl text-[#E85D04]"><FaChartLine /></div>
                  <span className="text-xs font-medium text-[#0F172A]/80">Career<br/>Growth</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Masterclass;
