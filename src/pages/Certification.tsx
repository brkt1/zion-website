import { FaArrowRight, FaAward, FaBookOpen, FaCalendarAlt, FaChartLine, FaCheckCircle, FaGraduationCap, FaLightbulb, FaRocket, FaShieldAlt, FaSitemap, FaUsers, FaVideo } from "react-icons/fa";
import OptimizedImage from "../Components/ui/OptimizedImage";

const Certification = () => {
  const weeks = [
    {
      number: "01",
      title: "Foundations of Event Management",
      icon: <FaBookOpen />,
      lessons: [
        { title: "What Is Event Management?", topics: ["Definition", "Types of events (wedding, corporate, expo, social)", "Role of an event manager"] },
        { title: "The Event Planning Process", topics: ["From idea → execution", "Event lifecycle stages"] },
        { title: "Event Concept Development", topics: ["Theme creation", "Target audience identification", "Event objectives setting"] },
      ],
      color: "#FFD447"
    },
    {
      number: "02",
      title: "Event Planning & Structuring",
      icon: <FaSitemap />,
      lessons: [
        { title: "Creating an Event Proposal", topics: ["Writing a professional proposal", "Presenting to clients"] },
        { title: "Event Timeline & Scheduling", topics: ["Creating detailed timelines", "Gantt chart basics"] },
        { title: "Event Checklist System", topics: ["Pre-event checklist", "Event-day checklist", "Post-event checklist"] },
      ],
      color: "#FF6F5E"
    },
    {
      number: "03",
      title: "Budgeting & Financial Management",
      icon: <FaChartLine />,
      lessons: [
        { title: "Building an Event Budget", topics: ["Fixed vs variable costs", "Estimation techniques"] },
        { title: "Pricing Strategy", topics: ["How to price services", "Profit margin calculation"] },
        { title: "Cost Control & Negotiation", topics: ["Vendor negotiation", "Avoiding overspending"] },
      ],
      color: "#4A90E2"
    },
    {
      number: "04",
      title: "Vendor & Venue Management",
      icon: <FaUsers />,
      lessons: [
        { title: "Vendor Sourcing & Selection", topics: ["Finding reliable suppliers", "Evaluating vendor quality"] },
        { title: "Contracts & Agreements", topics: ["Basic contract structure", "Protecting your business"] },
        { title: "Venue Selection & Site Inspection", topics: ["Capacity planning", "Layout planning", "Risk assessment"] },
      ],
      color: "#2ecc71"
    },
    {
      number: "05",
      title: "Marketing & Sponsorship",
      icon: <FaLightbulb />,
      lessons: [
        { title: "Event Marketing Strategy", topics: ["Social media promotion", "Influencer collaboration"] },
        { title: "Sponsorship Strategy", topics: ["Creating sponsorship packages", "Approaching sponsors"] },
        { title: "Branding an Event", topics: ["Logo & theme alignment", "Audience engagement strategy"] },
      ],
      color: "#9b59b6"
    },
    {
      number: "06",
      title: "Event Operations & Execution",
      icon: <FaRocket />,
      lessons: [
        { title: "Event-Day Management", topics: ["Team coordination", "Managing suppliers on site"] },
        { title: "Stage & Technical Setup", topics: ["Lighting basics", "Sound basics", "Booth organization"] },
        { title: "Crowd Management & Guest Experience", topics: ["Guest flow control", "VIP handling"] },
      ],
      color: "#34495e"
    },
    {
      number: "07",
      title: "Risk & Crisis Management",
      icon: <FaShieldAlt />,
      lessons: [
        { title: "Identifying Event Risks", topics: ["Weather issues", "Vendor failure", "Power outage"] },
        { title: "Crisis Handling & Problem Solving", topics: ["Quick decision making", "Conflict resolution"] },
        { title: "Legal & Ethical Considerations", topics: ["Permits", "Insurance basics", "Professional ethics"] },
      ],
      color: "#e74c3c"
    },
    {
      number: "08",
      title: "Business & Career Development",
      icon: <FaAward />,
      lessons: [
        { title: "Starting Your Own Event Business", topics: ["Registration basics", "Building a brand"] },
        { title: "Client Acquisition Strategy", topics: ["Finding clients", "Closing deals"] },
        { title: "Scaling & Building a Team", topics: ["Hiring", "Delegation", "Growth planning"] },
      ],
      color: "#1C2951"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-slate-50 z-0" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-50/50 to-transparent z-0" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-100 text-amber-700 font-bold text-xs uppercase tracking-widest mb-8">
              <FaGraduationCap /> Official Certification Program
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
              Professional Event <br />
              <span className="text-gold-gradient italic">Management Certification</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-light leading-relaxed mb-12">
              A comprehensive 8-week journey designed to transform you from an event enthusiast into a certified industry professional. Build, lead, and scale world-class experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a 
                href="https://learn.yenege.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto glow-button-light px-12 py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl transition-all active:scale-95"
              >
                Go to E-Learning Platform
              </a>
              <a 
                href="#curriculum"
                className="w-full sm:w-auto px-12 py-5 rounded-2xl border border-slate-200 font-bold text-sm tracking-widest uppercase hover:bg-white transition-all text-slate-600 shadow-sm"
              >
                View Curriculum
              </a>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-200/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 -right-24 w-64 h-64 bg-rose-200/20 rounded-full blur-[80px]" />
      </section>

      {/* Expectation Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 text-2xl">
                <FaVideo />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Interactive Learning</h3>
              <p className="text-slate-500 leading-relaxed font-light">High-quality video lessons, live webinars, and interactive sessions with industry leaders.</p>
            </div>
            <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 text-2xl">
                <FaUsers />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Community Access</h3>
              <p className="text-slate-500 leading-relaxed font-light">Join a private network of peers and mentors. Collaborate on real-world event simulations.</p>
            </div>
            <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl">
                <FaAward />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Industry Credential</h3>
              <p className="text-slate-500 leading-relaxed font-light">Earn a recognized certification upon passing the final project and examinations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Timeline */}
      <section id="curriculum" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[2px] w-12 bg-amber-500" />
              <span className="text-amber-600 font-sans tracking-[0.4em] uppercase text-xs font-black">Program Roadmap</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none mb-8">
              8-Week Professional <br />
              <span className="italic text-gold-gradient">Masterclass.</span>
            </h2>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            {weeks.map((week, idx) => (
              <div key={idx} className="group relative">
                <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                  {/* Left Column: Week Badge */}
                  <div className="md:w-1/4">
                    <div className="sticky top-32">
                      <div className="relative inline-block">
                        <div 
                          className="w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center text-4xl shadow-2xl transition-transform duration-500 group-hover:scale-110"
                          style={{ background: week.color, color: 'white' }}
                        >
                          {week.icon}
                        </div>
                        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg border border-slate-100">
                          <span className="font-black text-slate-900 text-sm">{week.number}</span>
                        </div>
                      </div>
                      <div className="mt-6">
                        <p className="text-xs uppercase tracking-[0.3em] font-black text-slate-400 mb-2">Duration</p>
                        <p className="font-bold text-slate-900 flex items-center gap-2">
                          <FaCalendarAlt className="text-amber-500" /> 7 Days
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Lessons */}
                  <div className="md:w-3/4">
                    <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-700">
                      <h3 className="text-2xl md:text-4xl font-black text-slate-900 mb-10 tracking-tight">
                        {week.title}
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {week.lessons.map((lesson, lIdx) => (
                          <div key={lIdx} className="space-y-4">
                            <div className="flex items-center gap-4">
                              <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">L{lIdx + 1}</span>
                              <h4 className="font-bold text-slate-800 text-lg">{lesson.title}</h4>
                            </div>
                            <ul className="space-y-2 pl-12 lg:pl-12">
                              {lesson.topics.map((topic, tIdx) => (
                                <li key={tIdx} className="flex items-center gap-3 text-slate-500 text-sm font-light">
                                  <FaCheckCircle className="text-amber-500/30 group-hover:text-amber-500 transition-colors" />
                                  {topic}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Connecting line */}
                {idx < weeks.length - 1 && (
                  <div className="hidden md:block absolute left-16 top-32 bottom-[-48px] w-[2px] bg-slate-200 -z-1 opacity-50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Project Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto glass-light p-10 md:p-24 rounded-[4rem] border-4 border-slate-50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block px-4 py-1.5 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-6">Capestone Module</div>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none mb-8">
                  The Final <br />
                  <span className="italic text-gold-gradient">Masterpiece.</span>
                </h2>
                <p className="text-lg text-slate-500 font-light leading-relaxed mb-10">
                  Theory meets reality. In your final week, you will architect a complete event plan that demonstrates your mastery over budgeting, marketing, risk, and execution.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Full Budget Submission",
                    "Marketing Strategy",
                    "Risk Management Plan",
                    "Execution Timeline"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
                      <FaCheckCircle className="text-green-500" />
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative group">
                <div className="aspect-square rounded-[3rem] overflow-hidden luxury-border-light shadow-2xl relative">
                  <OptimizedImage 
                    src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop" 
                    alt="Industry Standard Portfolio" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute bottom-10 left-10 right-10 text-white">
                    <p className="text-xs uppercase tracking-widest font-black text-amber-500 mb-2">Outcome</p>
                    <h3 className="text-2xl font-bold">Industry Standard Portfolio</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certificate CTA */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto relative z-10">
            <FaAward className="text-amber-500 text-7xl md:text-8xl mx-auto mb-8 animate-pulse" />
            <h2 className="text-4xl md:text-7xl font-black text-white leading-tight tracking-tight mb-8">
              Seal Your Future with <br />
              <span className="italic text-[#FFD447]">Global Certification.</span>
            </h2>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto mb-16 leading-relaxed">
              Upon successful completion, receive a certified credential from Yenege ecosystem, validated by our industry partners.
            </p>
            
            <a 
              href="https://learn.yenege.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 bg-white text-slate-900 px-16 py-7 rounded-full font-black text-sm tracking-widest uppercase hover:bg-amber-400 transition-all hover:scale-105 shadow-2xl active:scale-95"
            >
              Start Your Certification <FaArrowRight />
            </a>
            
            <p className="mt-8 text-gray-500 text-xs tracking-widest uppercase font-black">Limited slots available per cohort.</p>
          </div>
        </div>

        {/* Background animation */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="h-full w-full" style={{ background: "radial-gradient(circle at 50% 50%, #FFD447 0%, transparent 70%)" }} />
        </div>
      </section>

      {/* FAQ Section Style Final Note */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium">Already have an account? <a href="https://learn.yenege.com/login" className="text-amber-600 font-bold border-b border-amber-500/30">Sign In to Dashboard</a></p>
        </div>
      </section>
    </div>
  );
};

export default Certification;
