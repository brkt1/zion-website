import { FaArrowRight, FaGraduationCap, FaNetworkWired, FaRocket, FaUsers, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { useAboutContent, useContactInfo } from "../hooks/useApi";

const About = () => {
  const { contactInfo } = useContactInfo();
  const { content } = useAboutContent();
  
  // Use data from API or fallback to standard content
  const story = content?.story || {
    title: "The Yenege Dream",
    content: `Yenege was born from a simple yet powerful vision: to bring happiness to life through meaningful connections and unforgettable experiences.

We believe that life's greatest moments happen when people come together—whether it's over a board game, on a weekend adventure, or simply sharing stories in a welcoming community space.

What started as a dream to create a space where people could escape the daily grind and truly connect has grown into a vibrant community of individuals who value joy, friendship, and living life to the fullest.

Every event we organize, every trip we plan, and every gathering we host is designed with one goal in mind: to bring a little more happiness into your life.`
  };
  
  const ceo = content?.ceo;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-block mb-4 sm:mb-6">
              <div 
                className="h-1 w-24 mx-auto mb-6 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 tracking-tighter uppercase px-2">
              <span 
                className="block"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ABOUT YENEGE
              </span>
            </h1>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8 md:mb-12 text-[#FF6F5E] tracking-tight">
              We Build Experiences That Build People.
            </h2>

            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4 font-light italic">
              Yenege is a modern lifestyle and experience platform based in Addis Ababa.
            </p>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full blur-[120px] opacity-10" style={{ background: "radial-gradient(circle, #FFD447 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] rounded-full blur-[120px] opacity-10" style={{ background: "radial-gradient(circle, #FF6F5E 0%, transparent 70%)" }} />
        </div>
      </section>

      {/* Intersection Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
             <div className="mb-12">
               <h3 className="text-xl font-bold uppercase tracking-widest text-gray-400 mb-4">We operate at the intersection of:</h3>
             </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Professional Event Execution", icon: <FaRocket />, color: "#FFD447" },
                { title: "Event Organizing Education", icon: <FaGraduationCap />, color: "#FF6F5E" },
                { title: "Community-Driven Experiences", icon: <FaUsers />, color: "#1C2951" }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-transform group-hover:rotate-12" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#1a1a1a]">
                    {item.title}
                  </h3>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <div className="inline-block p-8 md:p-12 rounded-[2.5rem] bg-white border border-gray-100 shadow-lg max-w-4xl">
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                  Our goal is simple:<br />
                  <span className="font-bold text-[#1C2951]">Create environments where ideas turn into experiences — and experiences turn into opportunity.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Beginning */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 max-w-6xl mx-auto">
            <div className="flex-1">
              <div className="h-1 w-16 mb-6 rounded-full bg-gradient-to-r from-[#FFD447] to-[#FF6F5E]"></div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 text-[#1a1a1a] tracking-tight">{story.title}</h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-light">
                <p className="text-2xl font-medium text-[#1C2951]">Yenege started with a powerful observation:</p>
                <p className="bg-yellow-50 p-4 border-l-4 border-[#FFD447] italic">"People attend events. Few understand how to build them."</p>
                {story.content.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-[#FFD447] to-[#FF6F5E] overflow-hidden shadow-2xl relative z-10 flex items-center justify-center">
                 <span className="text-8xl md:text-9xl font-black text-white/30 select-none uppercase">Origin</span>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#1C2951] rounded-full blur-3xl opacity-20 z-0"></div>
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#FFD447] rounded-full blur-3xl opacity-20 z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Difference Section */}
      <section className="py-20 md:py-32 bg-[#1C2951] text-white overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight">What Makes Yenege Different</h2>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light">
                We don’t just organize weddings, corporate functions, or community gatherings. We design complete experience systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-8 text-[#FFD447]">Behind every event is:</h3>
                <ul className="space-y-6">
                  {[
                    "Structured planning frameworks",
                    "Vendor coordination models",
                    "Financial strategy",
                    "Operational systems",
                    "Experience design principles"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-4 text-lg md:text-xl">
                      <div className="w-2 h-2 rounded-full bg-[#FF6F5E]"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10">
                <h3 className="text-2xl font-bold mb-6 text-[#FF6F5E]">Professional Academy</h3>
                <p className="text-lg leading-relaxed text-gray-300 font-light mb-6">
                  Our academy teaches these professional systems without exposing proprietary internal processes.
                </p>
                <p className="text-lg leading-relaxed text-gray-300 font-light italic">
                  This ensures our students gain real-world skills while Yenege maintains its competitive structure.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative background shape */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rotate-12 opacity-5 pointer-events-none">
          <div className="w-full h-full border-[100px] border-[#FFD447] rounded-full"></div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 md:mb-24">
            <div className="h-1 w-16 mx-auto mb-6 rounded-full bg-[#FFD447]"></div>
            <h2 className="text-3xl md:text-6xl font-bold text-[#1a1a1a] tracking-tight mb-6">Our Ecosystem</h2>
            <p className="text-xl text-gray-600">Yenege functions through three connected pillars</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
            {[
              { 
                num: "1", 
                title: "Event Production", 
                desc: "Full-scale planning and execution for private, corporate, and community events.",
                icon: <FaRocket />
              },
              { 
                num: "2", 
                title: "Event Organizing Academy", 
                desc: "Structured professional training in event management — from foundation to execution.",
                icon: <FaGraduationCap />
              },
              { 
                num: "3", 
                title: "Community & Collaboration", 
                desc: "A growing network of creatives, planners, vendors, and partners building together.",
                icon: <FaNetworkWired />
              }
            ].map((pillar, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -top-10 -left-6 text-9xl font-black text-gray-50 z-0 group-hover:text-[#FFD447]/10 transition-colors pointer-events-none">
                  0{pillar.num}
                </div>
                <div className="relative z-10 bg-white p-10 lg:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-3">
                  <div className="text-3xl text-gray-300 group-hover:text-[#FF6F5E] transition-colors mb-8">{pillar.icon}</div>
                  <h3 className="text-2xl font-extrabold mb-6 text-[#1a1a1a] leading-tight">{pillar.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-light">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 flex flex-wrap justify-center gap-6 text-sm md:text-lg font-bold uppercase tracking-widest text-[#1C2951]">
             <div className="flex items-center gap-2">Execution <FaArrowRight className="text-[#FF6F5E]" /> Education</div>
             <div className="flex items-center gap-2">Education <FaArrowRight className="text-[#FF6F5E]" /> Innovation</div>
             <div className="flex items-center gap-2">Community <FaArrowRight className="text-[#FF6F5E]" /> Growth</div>
          </div>
        </div>
      </section>

      {/* Academy CTA Section */}
      <section className="py-24 bg-[#1C2951] relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
             <div className="flex-1 space-y-8">
                <div className="inline-block px-4 py-1 bg-white/10 text-[#FFD447] rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">Learning Ecosystem</div>
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">The Academy of <br /><span className="text-[#FF6F5E] italic">Event Masters.</span></h2>
                <p className="text-xl text-gray-400 font-light leading-relaxed">
                  Join our Professional Event Management Certification. An intensive, system-driven program designed to turn passion into professional precision.
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                   <Link 
                    to="/certification" 
                    className="glow-button-light px-10 py-5 rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl shadow-amber-500/10 active:scale-95 transition-all"
                   >
                     Explore Program
                   </Link>
                   <a 
                    href="https://learn.yenege.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-10 py-5 rounded-2xl border border-white/10 text-white font-bold text-xs tracking-widest uppercase hover:bg-white/5 transition-all"
                   >
                     Go to E-Learning
                   </a>
                </div>
             </div>
             <div className="flex-1 relative">
                <div className="aspect-[4/3] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative group">
                   <img 
                    src="https://images.unsplash.com/photo-1524178232363-1fb28f74b0cd?q=80&w=800&auto=format&fit=crop" 
                    className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000" 
                    alt="Academy Class" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#1C2951] to-transparent opacity-80" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <FaGraduationCap className="text-white/20 text-9xl group-hover:scale-110 transition-transform duration-700" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision & Philosophy */}
      <section className="py-20 md:py-32 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 max-w-7xl mx-auto">
            <div className="space-y-12">
              <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold uppercase tracking-widest text-[#FF6F5E] mb-6">Our Mission</h3>
                <p className="text-2xl md:text-3xl font-light text-gray-800 leading-tight">
                  {content?.mission?.content || "To build Ethiopia’s most trusted experience and event education platform — empowering individuals while delivering exceptional events."}
                </p>
              </div>
              <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold uppercase tracking-widest text-[#FFD447] mb-6">Our Vision</h3>
                <p className="text-2xl md:text-3xl font-light text-gray-800 leading-tight">
                  {content?.vision?.content || "To become the leading ecosystem for event professionals and curated experiences across Ethiopia and beyond."}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="h-full bg-[#1a1a1a] text-white p-10 md:p-16 rounded-[4rem] flex flex-col justify-center">
                <h2 className="text-xl font-bold uppercase tracking-widest text-[#FF6F5E] mb-8">Our Philosophy</h2>
                <p className="text-2xl md:text-3xl font-bold mb-12 leading-tight">We believe events are not decorations and schedules.</p>
                <div className="space-y-8">
                  {[
                    "Economic opportunities",
                    "Community builders",
                    "Career launchpads",
                    "Memory creators"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-bold group-hover:bg-[#FFD447] group-hover:text-black transition-all">
                        {idx + 1}
                      </div>
                      <span className="text-xl md:text-2xl font-light text-gray-300 italic group-hover:text-white transition-colors">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-16 text-lg text-gray-400 font-light border-t border-white/10 pt-8">
                  Yenege exists to professionalize the industry while keeping creativity at its core.
                </p>
              </div>
              
              {/* Accents */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FFD447] rounded-full blur-[100px] opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CEO Section - Professional & Modern */}
      <section className="py-24 md:py-32 bg-white overflow-hidden relative">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              {/* Image Column */}
              <div className="w-full lg:w-5/12 relative">
                <div className="relative z-10 aspect-[4/5] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl luxury-border-light">
                  {ceo?.image ? (
                    <OptimizedImage 
                      src={ceo.image} 
                      alt={ceo.name} 
                      className="w-full h-full object-cover grayscale md:grayscale hover:grayscale-0 transition-all duration-1000"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <FaUsers className="text-gray-300 text-8xl md:text-9xl opacity-20" />
                    </div>
                  )}
                  {/* Glassmorphism Name Tag */}
                  <div className="absolute bottom-10 left-10 right-10 p-6 md:p-8 backdrop-blur-md bg-white/10 border border-white/20 rounded-[2rem] text-white">
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight">{ceo?.name || "Bereket Yosef"}</h3>
                    <p className="text-white/70 uppercase tracking-[0.2em] text-[10px] font-bold mt-2">{ceo?.title || "Founder & CEO"}</p>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -z-1" />
                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -z-1" />
              </div>

              {/* Content Column */}
              <div className="w-full lg:w-7/12 space-y-10 lg:pl-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-[2px] w-12 bg-amber-500" />
                    <span className="text-amber-500 font-sans tracking-[0.4em] uppercase text-[10px] font-black">Founder's vision</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                    Crafting Ethiopia's <br />
                    <span className="italic text-gold-gradient">Creative Future.</span>
                  </h2>
                </div>

                <div className="space-y-6 text-lg md:text-xl text-slate-600 leading-relaxed font-light">
                  {ceo?.bio ? (
                    ceo.bio.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))
                  ) : (
                    <>
                      <p>Bereket Yosef is a visionary entrepreneur dedicated to redefining the experience economy in Ethiopia. With a deep focus on strategic event management and community architecture, he founded Yenege to bridge the gap between world-class execution and transformative education.</p>
                      <p>His dual model ensures that every event is not just a moment in time, but a foundation for the next generation of professional event designers.</p>
                    </>
                  )}
                </div>

                {ceo?.quote && (
                  <div className="relative py-8 px-10 border-l-4 border-amber-500 bg-gray-50 rounded-r-[2rem]">
                    <p className="text-xl md:text-2xl font-serif italic text-slate-800 leading-relaxed font-light">
                      "{ceo.quote}"
                    </p>
                  </div>
                )}

                {ceo?.socialLinks && ceo.socialLinks.length > 0 && (
                  <div className="flex items-center gap-8 pt-6">
                    <span className="text-xs uppercase tracking-widest font-black text-slate-400">Connect</span>
                    <div className="flex gap-6">
                      {ceo.socialLinks.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-500 transition-colors font-bold uppercase text-[10px] tracking-widest">{link.platform}</a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Footer */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 tracking-tight text-[#1a1a1a]">Ready to build something together?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-2xl mx-auto">
            <Link 
              to="/apply" 
              className="flex-1 py-5 px-10 rounded-full bg-[#1C2951] text-white font-bold text-lg hover:bg-[#FF6F5E] transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              Join the Academy <FaArrowRight />
            </Link>
            <a 
              href={`https://wa.me/${contactInfo?.phone?.replace(/\D/g, '') || '251978639887'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-5 px-10 rounded-full border-2 border-[#1C2951] text-[#1C2951] font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
            >
              <FaWhatsapp className="text-green-500" /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
