import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCrown, FaUsers, FaHandshake, FaChartBar, FaChevronDown, FaCheckCircle, FaUserCheck, FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function YenegeUnityLanding() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Initialize state from localStorage so it only plays once per user
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem('yenege_unity_envelope_opened') === 'true';
  });
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('yenege_unity_envelope_opened') === 'true';
  });

  // Monitor scroll to trigger envelope opening
  useEffect(() => {
    // If already opened previously, don't attach scroll listeners
    if (localStorage.getItem('yenege_unity_envelope_opened') === 'true') {
      return;
    }

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 40 && !isOpen) {
        setIsOpen(true);
        localStorage.setItem('yenege_unity_envelope_opened', 'true');
      }
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // Dismiss overlay after animation finishes
  useEffect(() => {
    if (isOpen && !isDismissed) {
      const timer = setTimeout(() => {
        setIsDismissed(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isDismissed]);

  // Handle manual click to open the envelope
  const handleOpenClick = () => {
    if (isOpen) return; // Prevent double clicks

    setIsOpen(true);
    localStorage.setItem('yenege_unity_envelope_opened', 'true');
    
    // Smooth scroll down by 320px to reveal main content
    const start = window.scrollY;
    const target = 320;
    const duration = 1000;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress;
        
      window.scrollTo(0, start + ease * (target - start));
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setIsDismissed(true);
      }
    };
    
    requestAnimationFrame(step);
  };

  const faqs = [
    {
      q: "የነገ ዩኒቲ (Yenege Unity) ምንድን ነው?",
      a: "በየ 15 ቀኑ የሚካሄድ፣ ንግግሮች የሌሉበት፣ ዋና አላማው አቅራቢዎችን እና ገዢዎችን ማገናኘት ብቻ የሆነ የቢዝነስ መድረክ ነው።"
    },
    {
      q: "ለምን በየ 15 ቀኑ ይካሄዳል?",
      a: "የንግድ ገበያ በየቀኑ ስለሚቀያየር፣ አቅራቢዎች አዳዲስ ደንበኞችን ያለማቋረጥ እና በፍጥነት እንዲያገኙ ለማድረግ ነው።"
    },
    {
      q: "ስፖንሰር ማድረግ ይቻላል?",
      a: "አዎ። በየ 15 ቀኑ በሚደረጉት ዝግጅቶቻችን ላይ ተከታታይ ማስተዋወቂያ የሚያገኙበት ለ 5 ኩባንያዎች ብቻ የተዘጋጀ የ\"መስራች አጋር\" (Founding Partner) ዕድል አለን።"
    }
  ];

  return (
    <div className="min-h-[120vh] bg-black text-white font-sans overflow-x-hidden selection:bg-amber-500 selection:text-black pb-20 relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700;850&display=swap');

        .font-serif {
          font-family: 'Cinzel', Georgia, serif;
        }
        .font-sans {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Wax Seal Style */
        .wax-seal {
          background: radial-gradient(circle, #aa0000 0%, #550000 60%, #2a0000 100%);
          box-shadow: 
            0 10px 25px rgba(0, 0, 0, 0.7),
            inset 0 2px 4px rgba(255, 255, 255, 0.15),
            inset 0 -4px 8px rgba(0, 0, 0, 0.6),
            0 0 20px rgba(85, 0, 0, 0.4);
          border: 2px solid #770000;
          position: relative;
        }
        .wax-seal::after {
          content: '';
          position: absolute;
          inset: 3px;
          border: 1px dashed rgba(255, 255, 255, 0.15);
          border-radius: 50%;
        }

        /* Shimmer effect for buttons */
        .btn-shine {
          position: relative;
          overflow: hidden;
        }
        .btn-shine::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 30%;
          height: 200%;
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(30deg);
          transition: none;
        }
        .btn-shine:hover::after {
          left: 120%;
          transition: all 0.7s ease-in-out;
        }

        /* Micro animations */
        .hover-gold-shadow {
          transition: all 0.3s ease;
        }
        .hover-gold-shadow:hover {
          box-shadow: 0 0 30px rgba(217, 119, 6, 0.15);
          border-color: rgba(217, 119, 6, 0.35);
          transform: translateY(-3px);
        }

        /* Elegant card grid background pattern */
        .card-pattern {
          background-image: radial-gradient(rgba(255, 200, 0, 0.04) 1px, transparent 0);
          background-size: 28px 28px;
        }
      `}</style>

      {/* Decorative Glow Elements */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/5 via-[#220000]/20 to-[#1a0000] pointer-events-none" />

      {/* ENVELOPE (POSTA) OPENING OVERLAY */}
      <div 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0000] overflow-hidden transition-all duration-1000 ease-in-out"
        style={{ 
          opacity: isOpen ? 0 : 1,
          visibility: isDismissed ? 'hidden' : 'visible',
          pointerEvents: isOpen ? 'none' : 'auto'
        }}
      >
        {/* Ambient glows behind envelope */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[90px] pointer-events-none" />

        {/* Greeting Label */}
        <div className="absolute top-10 md:top-16 text-center px-4 max-w-lg z-10 space-y-3">
          <p className="text-amber-400 font-serif tracking-widest text-xs md:text-sm uppercase animate-pulse">የክብር ግብዣ • Special Invitation</p>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-widest font-serif">YENEGE UNITY</h2>
          <div className="w-16 h-[1px] bg-amber-500/40 mx-auto" />
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
            በየ 15 ቀኑ በአዲስ አበባ የሚካሄድ፣ በግብዣ ብቻ የሚገቡበት ልዩ የንግድ ትስስር መድረክ።
          </p>
        </div>

        {/* Envelope Container */}
        <div className="relative w-[92%] sm:w-[500px] aspect-[1.5] mx-auto mt-28 z-20" style={{ perspective: '1200px' }}>
          {/* Envelope Back */}
          <div className="absolute inset-0 bg-[#2a0000] border border-amber-500/20 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#150000] to-[#1a0000]" />
          </div>

          {/* Invitation Card Inside */}
          <div 
            className="absolute inset-x-4 bottom-4 h-[86%] bg-[#1a0000] border border-amber-500/35 rounded-xl p-5 flex flex-col justify-between shadow-2xl transition-all duration-1000 ease-in-out"
            style={{
              transform: isOpen ? 'translateY(-150px) scale(1.02)' : 'translateY(0) scale(0.94)',
              zIndex: isOpen ? 25 : 10,
              boxShadow: isOpen ? '0 25px 45px rgba(0,0,0,0.9)' : 'none'
            }}
          >
            <div className="border border-amber-500/20 rounded-lg p-4 h-full flex flex-col items-center justify-center text-center">
              <FaCrown className="text-amber-400 text-2xl mb-2 animate-bounce" />
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-serif">የክብር ግብዣ</span>
              <h4 className="text-sm font-bold text-white tracking-widest mt-1 uppercase font-serif">Yenege Unity</h4>
              <div className="w-8 h-[1px] bg-amber-500/30 my-2" />
              <p className="text-[10px] text-gray-400">በየ 15 ቀኑ የሚካሄድ የክብር መድረክ</p>
              <p className="text-[9px] text-amber-500/70 mt-2 font-mono">CODE: YU-2026-VIP</p>
            </div>
          </div>

          {/* Envelope Left Flap */}
          <div 
            className="absolute inset-y-0 left-0 w-1/2 bg-[#1e0000] border-l border-amber-500/5 shadow-r-lg z-20" 
            style={{ clipPath: 'polygon(0 0, 0 100%, 100% 50%)' }}
          />

          {/* Envelope Right Flap */}
          <div 
            className="absolute inset-y-0 right-0 w-1/2 bg-[#1e0000] border-r border-amber-500/5 shadow-l-lg z-20" 
            style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 50%)' }}
          />

          {/* Envelope Bottom Flap */}
          <div 
            className="absolute inset-x-0 bottom-0 h-[60%] bg-[#200000] border-b border-amber-500/5 shadow-t-lg z-20" 
            style={{ clipPath: 'polygon(0 100%, 100% 100%, 50% 0)' }}
          />

          {/* Envelope Top Flap (Flips Open) */}
          <div 
            className="absolute inset-x-0 top-0 h-[50%] bg-[#250000] border-t border-amber-500/10 origin-top transition-transform duration-700 ease-in-out z-30"
            style={{ 
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              transform: isOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
              backfaceVisibility: 'hidden'
            }}
          />

          {/* Wax Seal */}
          <div 
            onClick={handleOpenClick}
            className="wax-seal absolute top-1/2 left-1/2 w-16 h-16 rounded-full flex items-center justify-center text-white cursor-pointer z-40 transition-all duration-500 ease-in-out"
            style={{
              transform: isOpen ? 'translate(-50%, -50%) scale(0)' : 'translate(-50%, -50%) scale(1)',
              opacity: isOpen ? 0 : 1,
              pointerEvents: isOpen ? 'none' : 'auto'
            }}
          >
            <FaCrown size={22} className="text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-pulse" />
          </div>
        </div>

        {/* Scroll/Click Instruction */}
        <div className="absolute bottom-10 text-center flex flex-col items-center gap-2 z-10">
          <div 
            className="w-10 h-10 rounded-full border border-amber-500/20 flex items-center justify-center text-amber-400 animate-bounce cursor-pointer hover:border-amber-500/40"
            onClick={handleOpenClick}
          >
            <FaChevronDown />
          </div>
          <p className="text-gray-500 text-xs tracking-wider uppercase font-medium">
            ይህንን ልዩ ግብዣ ለመክፈት ማህተሙን ይጫኑ ወይም ወደ ታች ይሸብልሉ
          </p>
        </div>
      </div>


      {/* MAIN INVITATION CARD PORTAL CONTENT */}
      <div 
        className="transition-all duration-1000 ease-in-out delay-300"
        style={{ 
           opacity: isOpen ? 1 : 0, 
           transform: isOpen ? 'translateY(0)' : 'translateY(40px)',
        }}
      >
        {/* Top Navigation */}
        <div className="absolute top-0 inset-x-0 h-24 z-40 flex items-center justify-between px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <Link to="/" className="text-lg md:text-2xl font-black tracking-widest text-white uppercase flex items-center gap-2 font-serif">
            <span className="text-amber-400">YENEGE</span> <span className="text-white font-light hidden xs:inline">UNITY</span>
          </Link>
          <Link 
            to="/yenege-unity/portal" 
            className="px-3 sm:px-5 py-2 sm:py-2.5 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 rounded-xl text-xs sm:text-sm font-bold text-amber-400 transition-all duration-300 flex items-center gap-1.5"
          >
            <FaUserCheck className="text-amber-400 flex-shrink-0" /> 
            <span className="hidden sm:inline">አባል መግቢያ (Portal Login)</span>
            <span className="sm:hidden">መግቢያ</span>
          </Link>
        </div>

        {/* Main card wrapper */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28" id="main-card">
          <div className="relative bg-gradient-to-b from-[#150000] to-[#0a0000] border border-amber-500/20 rounded-3xl p-6 sm:p-8 md:p-16 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden card-pattern">
          
          {/* Gold Corners for Invitation Box Effect */}
          <div className="absolute top-4 left-4 w-10 h-10 border-t border-l border-amber-500/30 rounded-tl-xl pointer-events-none" />
          <div className="absolute top-4 right-4 w-10 h-10 border-t border-r border-amber-500/30 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-10 h-10 border-b border-l border-amber-500/30 rounded-bl-xl pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-10 h-10 border-b border-r border-amber-500/30 rounded-br-xl pointer-events-none" />
          
          {/* Header inside Card */}
          <div className="flex flex-col items-center text-center mb-16 relative z-10">
            <div className="w-14 h-14 rounded-full bg-amber-500/5 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
              <FaCrown size={24} />
            </div>
            <span className="text-amber-400 font-serif tracking-widest text-[10px] md:text-xs uppercase mb-1">የክብር ግብዣ • Special Invitation</span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-widest uppercase font-serif">YENEGE UNITY</h1>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-3" />
          </div>

          {/* Hero Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/35 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
                <FaCrown className="animate-pulse" /> በግብዣ ብቻ የሚገቡበት የንግድ ትስስር መድረክ
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight font-serif text-white">
                የድርጅትዎን ገበያ እና ግንኙነት የሚያሳድጉበት <br />
                <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(85,0,0,0.3)]">
                  ልዩ ስነ-ምህዳር
                </span>
              </h2>

              <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light font-sans max-w-2xl mx-auto lg:mx-0">
                የነገ ዩኒቲ (YENEGE UNITY) በየ 15 ቀኑ በአዲስ አበባ የሚካሄድ፣ አቅራቢዎችን (Vendors)፣ ነጋዴዎችን እና የድርጅት ባለቤቶችን በቀጥታ ከገዢዎች እና ከባለሀብቶች ጋር የሚያገናኝ ዘመናዊ የንግድ መድረክ ነው። እዚህ መድረክ ላይ ንግግር የለም፤ ሰዓትዎን የሚያባክን ነገር የለም፤ የሚደረገው ቀጥተኛ የንግድ ትስስር ብቻ ነው።
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  to="/yenege-unity/apply"
                  className="btn-shine px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black rounded-xl text-center shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-amber-500"
                >
                  ለቀጣዩ ዝግጅት ቦታ ይያዙ
                </Link>
                <a
                  href="#agenda"
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-center border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  ዝርዝር መረጃ
                </a>
              </div>

              {/* Stat Boxes */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-amber-500/10 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <p className="text-2xl md:text-3xl font-extrabold text-amber-400 font-serif">50</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">ተሳታፊዎች ብቻ</p>
                </div>
                <div className="text-center lg:text-left border-x border-amber-500/10 px-2">
                  <p className="text-2xl md:text-3xl font-extrabold text-amber-400 font-serif">15</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">በየ ቀኑ</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl md:text-3xl font-extrabold text-amber-400 font-serif">1-ለ-1</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">ቀጥተኛ ትስስር</p>
                </div>
              </div>
            </div>

            {/* Right Side Image Box */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative group max-w-md w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-3xl blur opacity-20 group-hover:opacity-35 transition duration-1000" />
                <div className="relative bg-[#2a0000] border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl p-2">
                  <div className="rounded-2xl overflow-hidden relative">
                    <img 
                      src="/yenege_unity_hero.png" 
                      alt="Yenege Unity Premium Networking" 
                      className="w-full h-56 sm:h-72 md:h-80 object-cover opacity-95 object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a0000] via-neutral-950/40 to-transparent" />
                  </div>
                  <div className="p-4 pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 font-serif">አዲስ አበባ, ኢትዮጵያ</p>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1.5 font-serif">የድርጅት መሪዎች መድረክ</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-light">
                      በየ 15 ቀኑ በጥንቃቄ የሚመረጡ 50 የድርጅት መሪዎች እና አቅራቢዎች ብቻ።
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Divider */}
          <div className="my-20 flex items-center justify-center gap-4">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <FaCrown className="text-amber-500/30 flex-shrink-0" />
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          </div>

          {/* Concept Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white font-serif">
                ከተለመዱት ስብሰባዎች በተለየ መልኩ የተዋቀረ
              </h2>
              <p className="text-gray-400 leading-relaxed font-light font-sans text-sm md:text-base">
                በተለመዱት የንግድ ስብሰባዎች ላይ አዳራሽ ውስጥ ተቀምጦ ንግግር መስማት እንጂ ትክክለኛውን ደንበኛ በአጋጣሚ ማግኘት ከባድ ነው። እኛ ጋር አሰራሩ ፍጹም የተለያየ ነው፡
              </p>
              <p className="text-gray-400 leading-relaxed font-light font-sans text-sm md:text-base">
                እርስዎ ከመጡ በኋላ ደንበኛ አይፈልጉም፤ እኛ አስቀድመን የእርስዎን የስራ ዘርፍ እና ማግኘት የሚፈልጉትን የሰው አይነት በማጥናት፣ ሊገናኙዋቸው ከሚገቡ <span className="text-amber-400 font-bold">3 እና 4 ዋና ዋና ሰዎች</span> ጋር አስቀድመን ቀጠሮ እናዘጋጅልዎታለን።
              </p>
            </div>
            
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-[#3d0000]/50 border border-amber-500/10 rounded-2xl space-y-3 hover-gold-shadow">
                <div className="w-12 h-12 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                  <FaCrown size={20} />
                </div>
                <h4 className="font-bold text-white text-base md:text-lg font-serif">ቅድመ-ጥናት</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  የእርስዎን የስራ ዘርፍ እና ማግኘት የሚፈልጉትን የሰው አይነት አስቀድመን እናጠናለን።
                </p>
              </div>
              
              <div className="p-6 bg-[#3d0000]/50 border border-amber-500/10 rounded-2xl space-y-3 hover-gold-shadow">
                <div className="w-12 h-12 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                  <FaUsers size={20} />
                </div>
                <h4 className="font-bold text-white text-base md:text-lg font-serif">ቀጥተኛ ትስስር</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  ሊገናኙዋቸው ከሚገቡ ዋና ዋና ሰዎች ጋር አስቀድመን ቀጠሮ እናዘጋጅልዎታለን።
                </p>
              </div>
            </div>
          </div>

          {/* Section Divider */}
          <div className="my-20 flex items-center justify-center gap-4">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <FaCrown className="text-amber-500/30 flex-shrink-0" />
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          </div>

          {/* Benefits Section */}
          <div className="space-y-12 relative z-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white font-serif">ለእናንተ የሚኖረው ጥቅም</h2>
              <p className="text-amber-500/70 max-w-2xl mx-auto font-light text-[10px] md:text-xs uppercase tracking-widest font-serif">
                ለንግድዎ የሚገኝ እውነተኛ ትርፍ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-[#3d0000]/50 border border-amber-500/10 rounded-3xl space-y-4 hover-gold-shadow">
                <div className="w-12 h-12 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400">
                  <FaHandshake size={24} />
                </div>
                <h3 className="text-lg font-bold text-white font-serif">ቀጥተኛ ደንበኛ ማግኘት</h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                  ምርት እና አገልግሎትዎን ለትልልቅ ኩባንያዎች ውሳኔ ሰጪዎች በቀጥታ የማስተዋወቅ እና የመሸጥ እድል።
                </p>
              </div>
              
              <div className="p-8 bg-[#3d0000]/50 border border-amber-500/10 rounded-3xl space-y-4 hover-gold-shadow">
                <div className="w-12 h-12 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400">
                  <FaChartBar size={24} />
                </div>
                <h3 className="text-lg font-bold text-white font-serif">የተለያዩ ዘርፎች ትስስር</h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                  የቴክኖሎጂ ባለሙያዎችን፣ የፋይናንስ ሰዎችን፣ የግብርና ምርት ላኪዎችን እና የማምረቻ ኢንዱስትሪዎችን በአንድ ቦታ ያግኙ።
                </p>
              </div>
              
              <div className="p-8 bg-[#3d0000]/50 border border-amber-500/10 rounded-3xl space-y-4 hover-gold-shadow">
                <div className="w-12 h-12 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400">
                  <FaUserCheck size={24} />
                </div>
                <h3 className="text-lg font-bold text-white font-serif">ስትራቴጂያዊ አቀማመጥ</h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                  የምሳ እና የኮክቴል ጠረጴዛዎች የሚዘጋጁት የእርስዎን የንግድ ፍላጎት መሰረት አድርጎ አስቀድሞ በተጠና አቀማመጥ ነው።
                </p>
              </div>
            </div>
          </div>

          {/* Section Divider */}
          <div className="my-20 flex items-center justify-center gap-4">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <FaCrown className="text-amber-500/30 flex-shrink-0" />
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          </div>

          {/* Step Flow Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10" id="agenda">
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white font-serif">
                ለመሳተፍ ምን መደረግ አለበት?
              </h2>
              <p className="text-amber-500/70 text-xs md:text-sm uppercase tracking-widest font-serif">
                በቀላሉ በ 3 ደረጃዎች የሚጠናቀቅ ሂደት
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                    <FaCheckCircle size={14} />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm md:text-base">ፈጣን አሰራር</h5>
                    <p className="text-xs text-gray-500 mt-0.5">በጥቂት ደቂቃዎች ውስጥ ማመልከቻዎን ማስገባት ይችላሉ።</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                    <FaCheckCircle size={14} />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm md:text-base">ግልጽ የሆነ ጥቅም</h5>
                    <p className="text-xs text-gray-500 mt-0.5">ቀጥተኛ ደንበኛ ማግኘት የሚያስችል መድረክ።</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-7 bg-[#2a0000]/90 border border-amber-500/10 p-6 md:p-8 rounded-3xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <h4 className="font-bold text-amber-400 uppercase tracking-widest text-[10px] md:text-xs font-serif">የአሰራር ሂደት (Simple 3-Step Flow)</h4>
              
              <div className="space-y-6 relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-amber-500 via-amber-500/20 to-transparent" />
                
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black flex items-center justify-center font-black flex-shrink-0 text-sm shadow-md shadow-amber-500/20 z-10">1</div>
                  <div>
                    <h5 className="font-bold text-white text-sm md:text-base font-serif">ቅጹን ይሙሉ (Submit Intake)</h5>
                    <p className="text-xs md:text-sm text-gray-400 mt-1 leading-relaxed">የሚሰሩትን ስራ፣ የሚሸጡትን ምርት/አገልግሎት እና ማግኘት የሚፈልጉትን የደንበኛ አይነት በቅጹ ላይ ይግለጹ።</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black flex items-center justify-center font-black flex-shrink-0 text-sm shadow-md shadow-amber-500/20 z-10">2</div>
                  <div>
                    <h5 className="font-bold text-white text-sm md:text-base font-serif">አስቀድሞ ማዘጋጀት (Matchmaking)</h5>
                    <p className="text-xs md:text-sm text-gray-400 mt-1 leading-relaxed">የእኛ የክሊየንት ቡድን የእርስዎን መረጃ በማጥናት፣ በዕለቱ አብረዋቸው ሊቀመጡ የሚገቡትን ተስማሚ ነጋዴዎች ይመድባል።</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black flex items-center justify-center font-black flex-shrink-0 text-sm shadow-md shadow-amber-500/20 z-10">3</div>
                  <div>
                    <h5 className="font-bold text-white text-sm md:text-base font-serif font-serif">የቀጠሮ አጀንዳዎን ይቀበሉ (Your Agenda)</h5>
                    <p className="text-xs md:text-sm text-gray-400 mt-1 leading-relaxed">ወደ አዳራሹ ከመግባትዎ በፊት፣ ከማን ጋር እንደሚቀመጡ እና ምን አይነት የንግድ ውይይት እንደሚያደርጉ የሚገልጽ የራስዎን ፕሮግራም በእጅዎ ይደርሰዎታል።</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Divider */}
          <div className="my-20 flex items-center justify-center gap-4">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <FaCrown className="text-amber-500/30 flex-shrink-0" />
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          </div>

          {/* Testimonials Section */}
          <div className="space-y-10 relative z-10">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white font-serif">የአጋሮቻችን ድምፅ</h2>
            </div>
            <div className="max-w-3xl mx-auto p-6 sm:p-8 md:p-12 bg-gradient-to-br from-[#2a0000] to-[#1a0000] border border-amber-500/10 rounded-3xl space-y-6 relative overflow-hidden shadow-xl hover-gold-shadow">
              <div className="absolute top-2 sm:top-6 left-4 sm:left-6 text-amber-500/10 font-serif text-6xl md:text-8xl pointer-events-none select-none">“</div>
              <p className="italic text-gray-300 text-sm md:text-base leading-relaxed text-center relative z-10 font-sans">
                "ሌላ ተራ ስብሰባ መስሎኝ ነበር። ነገር ግን የነገ ዩኒቲ የእኔን የሎጅስቲክስ አገልግሎት የሚፈልጉ ሁለት ትልልቅ የግብርና ምርት ላኪዎችን በቀጥታ አገናኘኝ። በሶስት ሳምንት ውስጥ ውል ተፈራረምን።"
              </p>
              <div className="text-center mt-6 relative z-10 font-serif">
                <p className="font-bold text-amber-400 text-base md:text-lg">ቴዎድሮስ ካሳሁን</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-sans">የካሳሁን ሳፕላይ ቼይን ዋና ስራ አስፈጻሚ</p>
              </div>
            </div>
          </div>

          {/* Section Divider */}
          <div className="my-20 flex items-center justify-center gap-4">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <FaCrown className="text-amber-500/30 flex-shrink-0" />
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto space-y-10 relative z-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-4xl font-bold text-white font-serif">በተደጋጋሚ የሚነሱ ጥያቄዎች</h2>
              <p className="text-gray-500 text-xs md:text-sm font-sans">ስለ ነገ ዩኒቲ እና ስለ አሰራራችን ማወቅ ያለብዎት</p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-[#2a0000] border border-amber-500/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-amber-500/20">
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-white hover:bg-white/5 transition-colors duration-200"
                  >
                    <span className="text-sm md:text-base font-sans">{faq.q}</span>
                    <FaChevronDown className={`text-amber-400 transition-transform duration-300 flex-shrink-0 ml-4 ${activeFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${activeFaq === index ? 'max-h-40 border-t border-amber-500/5' : 'max-h-0'}`}
                  >
                    <div className="px-6 py-5 text-xs md:text-sm text-gray-400 leading-relaxed font-sans">
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Divider */}
          <div className="my-20 flex items-center justify-center gap-4">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <FaCrown className="text-amber-500/30 flex-shrink-0" />
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          </div>

          {/* Footer CTA & Details */}
          <div className="text-center space-y-8 relative z-10 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white font-serif">የቀጣዩ ዝግጅት ተሳታፊ ይሁኑ</h2>
            <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light font-sans">
              የዝግጅቱን ጥራት ለመጠበቅ በየዙሩ መሳተፍ የሚችሉት 50 ድርጅቶች ብቻ ናቸው። አሁኑኑ ቦታዎን ያስይዙ።
            </p>
            <div className="pt-4 pb-12 border-b border-amber-500/10">
              <Link
                to="/yenege-unity/apply"
                className="btn-shine inline-block px-10 py-5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black rounded-2xl text-base md:text-lg shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-amber-500"
              >
                ለመሳተፍ ማመልከቻ ያስገቡ
              </Link>
            </div>
            
            {/* Custom Footer Details inside card */}
            <div className="pt-8 space-y-6 text-xs md:text-sm text-gray-500 font-sans">
               <div className="font-bold text-white text-lg tracking-widest font-serif">YENEGE UNITY</div>
               <p className="text-gray-400 max-w-md mx-auto">የኢትዮጵያን ቀጣይ ትውልድ የንግድ ስነ-ምህዳር መገንባት።</p>
               
               <div className="flex flex-col md:flex-row gap-6 md:gap-12 mt-4 items-center justify-center text-gray-400">
                 <a href="mailto:yenegeevents@gmail.com" className="flex items-center gap-2 hover:text-amber-400 transition-colors duration-200">
                   <FaEnvelope className="text-amber-400" />
                   <span>yenegeevents@gmail.com</span>
                 </a>
                 <a href="https://wa.me/251978639887" className="flex items-center gap-2 hover:text-amber-400 transition-colors duration-200">
                   <FaWhatsapp className="text-amber-400" />
                   <span>+251 978 639 887</span>
                 </a>
               </div>
               
               <div className="max-w-xl mx-auto text-center mt-4 text-gray-400 flex items-start justify-center gap-2">
                  <FaMapMarkerAlt className="text-amber-400 flex-shrink-0 mt-1" />
                  <span>አሚር ኮሜርሻል ኮምፕሌክስ፣ 12ኛ ፎቅ፣ ቢሮ ቁጥር 12-003፣ ጋቦን ጎዳና (ኦሊምፒያ)፣ ቦሌ ክፍለ ከተማ፣ አዲስ አበባ፣ ኢትዮጵያ።</span>
               </div>
               
               <div className="mt-12 pt-8 border-t border-amber-500/10 w-full text-center text-gray-600 text-[10px] md:text-xs">
                  © 2026 YENEGE. መብቱ በህግ የተጠበቀ ነው።
               </div>
            </div>
          </div>

          </div>
        </div>
      </div>
    </div>
  );
}
