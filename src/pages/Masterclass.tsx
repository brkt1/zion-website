import { useEffect, useState } from "react";
import { 
  FaArrowRight, FaAward, FaCheck, FaChevronDown,
  FaClipboardList, FaCreditCard, FaLaptop, FaLock,
  FaPlayCircle, FaShieldAlt, FaStar, FaUsers
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

const Masterclass = () => {
  const { t, language } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    document.title = `${t.masterclassPage.title || 'Yenege Academy Masterclass'} | YENEGE`;
    window.scrollTo(0, 0);
  }, [t, language]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const whyStudyUs = [
    {
      title: language === 'am' ? "እውቅና ያለው ሰርተፍኬት" : language === 'om' ? "Waraqaa Ragaa Beekamtii Qabu" : "Accredited Certificate",
      desc: language === 'am' ? "በዘርፉ ተቀባይነት ያለው ሰርተፍኬት በማግኘት የሙያ ብቃትዎን ያሳድጉ።" : language === 'om' ? "Waraqaa ragaa ogummaa argachuun dandeettii keessan guddisaa." : "Earn industry-recognized credentials to boost your CV, LinkedIn profile, and job prospects.",
      icon: <FaAward className="text-3xl text-[#FFD447]" />
    },
    {
      title: language === 'am' ? "የተግባር ስልጠና" : language === 'om' ? "Shaakala Dhugaa" : "Real-World Case Studies",
      desc: language === 'am' ? "በእውነተኛ የኢቨንት ስራዎች፣ በባጀት እና በሎጂስቲክስ ላይ በተግባር ይለማመዱ።" : language === 'om' ? "Shaakala qophii dhugaa, bajata fi lojistikii irratti leenji'aa." : "Work on actual event scenarios, budgeting templates, vendor management, and crisis control.",
      icon: <FaClipboardList className="text-3xl text-[#FF6F5E]" />
    },
    {
      title: language === 'am' ? "የሙያ ማህበረሰብ" : language === 'om' ? "Hawaasa Ogummaa" : "Executive Networking",
      desc: language === 'am' ? "ከኢቨንት አደራጆች እና ከአጋሮች ጋር የቅርብ የትብብር ግንኙነት ይፍጠሩ።" : language === 'om' ? "Ogeessota fi qopheessitoota qophii waliin wal-quunnamsiisaa." : "Connect with peers, event organizers, and hiring managers in exclusive community forums.",
      icon: <FaUsers className="text-3xl text-[#7B5CFF]" />
    },
    {
      title: language === 'am' ? "ቀላል እና ፈጣን ክፍያ" : language === 'om' ? "Kaffaltii Saffisaa" : "Instant Secure Access",
      desc: language === 'am' ? "በቴሌብር ወይም በንግድ ባንክ በኩል በምቾት ይክፈሉ።" : language === 'om' ? "Telebirr ykn Baankii Daldalaatiin kaffalaa." : "Pay easily via Telebirr or CBE Bank and gain instant access to your course dashboard.",
      icon: <FaLock className="text-3xl text-[#3CCFCF]" />
    }
  ];

  const faqs = [
    {
      q: language === 'am' ? "ስልጠናውን ስጨርስ ህጋዊ ሰርተፍኬት አገኛለሁ?" : language === 'om' ? "Waraqaa ragaa seeraa ni argadhaa?" : "Will I receive an official certificate upon course completion?",
      a: language === 'am' ? "አዎ! እያንዳንዱ ተመረቂ ከየነገ አካደሚ ህጋዊ እና የተረጋገጠ ዲጂታል ሰርተፍኬት ያገኛል።" : language === 'om' ? "Eeyyee! Leenjisaan hundi waraqaa ragaa beekamtii qabu ni argata." : "Yes! Every graduate receives a verified digital certificate from Yenege Academy that you can showcase on LinkedIn, your resume, or print for your portfolio."
    },
    {
      q: language === 'am' ? "ምን አይነት የክፍያ አማራጮች አሉ?" : language === 'om' ? "Filannoowwan kaffaltii maal fa'a?" : "What payment methods are accepted?",
      a: language === 'am' ? "በቴሌብር፣ በኢትዮጵያ ንግድ ባንክ (CBE Birr / Bank Transfer) በኩል መክፈል ይችላሉ።" : language === 'om' ? "Telebirr fi Baankii Daldalaa Itoophiyaatiin kaffaluu ni dandeessu." : "We support instant local payments via Telebirr, Commercial Bank of Ethiopia (CBE Bank Transfer & CBE Birr), and major cards."
    },
    {
      q: language === 'am' ? "ስልጠናው ቀደም ሲል ልምድ ለሌላቸው ተስማሚ ነው?" : language === 'om' ? "Leenjiin kun namoota muuxannoo hin qabneef ni ta'aa?" : "Are the courses suitable for beginners with no event experience?",
      a: language === 'am' ? "በፍፁም! ስልጠናው ከመጀመሪያው ጀምሮ በግልጽ እና በተግባር የተዘጋጀ ነው።" : language === 'om' ? "Eeyyee! Leenjiin kun jalqaba irraa kaasee bifa salphaan qopha'e." : "Absolutely! The program is structured step-by-step to guide complete beginners as well as active event organizers looking to professionalize their execution."
    },
    {
      q: language === 'am' ? "የስልጠና ክፍለ-ጊዜዎች እንዴት ናቸው?" : language === 'om' ? "Sagantaan leenjii akkamitti?" : "Are there fixed schedules or self-paced options?",
      a: language === 'am' ? "የሳምንት መጨረሻ በአካል እና በኦንላይን የሚሰጡ ተለዋዋጭ መርሃ-ግብሮች አሉን።" : language === 'om' ? "Sagantaa dhuma torbanitiin toora interneetiin ykn qaamaan hirmaachuu ni dandeessu." : "You get flexible options: access self-paced digital modules 24/7 or attend live interactive weekend sessions & in-person practical workshops."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-x-hidden selection:bg-[#FFD447] selection:text-[#1C2951] pb-24">
      
      {/* ── HERO SECTION ────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-32 lg:pt-40 pb-12 sm:pb-20 overflow-hidden">
        {/* Background ambient radial gradients */}
        <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-radial from-[#FFD447]/10 via-transparent to-transparent blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-radial from-[#FF6F5E]/10 via-transparent to-transparent blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Column Content */}
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              
              {/* Pill badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFD447] shadow-[0_0_12px_#FFD447]" />
                <span className="text-[#FFD447] font-black text-xs uppercase tracking-[0.25em]">YENEGE ACADEMY</span>
              </div>
              
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white">
                {t.masterclassPage.title}<br />
                <span className="bg-gradient-to-r from-[#FFD447] via-[#FF6F5E] to-[#7B5CFF] bg-clip-text text-transparent italic">
                  {language === 'am' ? 'የኢቨንት አመራር እና ዲዛይን' : language === 'om' ? 'Ogummaa Dursoommaa Qophii' : 'Master Event Leadership'}
                </span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                {t.masterclassPage.subtitle}
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 sm:gap-3">
                <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-2">
                  <FaLaptop className="text-[#FFD447]" /> {language === 'am' ? 'የ8 ሳምንታት ስልጠና' : language === 'om' ? 'Torban 8 Guutuu' : '8 Weeks Intensive'}
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-2">
                  <FaShieldAlt className="text-[#FF6F5E]" /> {t.masterclassPage.certifiedCohort}
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-2">
                  <FaCreditCard className="text-[#3CCFCF]" /> Telebirr &amp; CBE Birr
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <Link 
                  to="/masterclass-registration" 
                  className="w-full sm:w-auto bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] hover:from-[#ffe066] hover:to-[#ff8273] text-[#1C2951] font-black px-8 py-4 rounded-full transition-all shadow-xl shadow-[#FF6F5E]/20 hover:scale-[1.02] flex items-center justify-center gap-3 text-xs sm:text-sm tracking-wider uppercase"
                >
                  {t.masterclassPage.enrollNow} <FaArrowRight />
                </Link>
                <a 
                  href="#courses" 
                  className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-extrabold transition-all text-xs sm:text-sm tracking-wider uppercase backdrop-blur-xl hover:border-white/40 text-center"
                >
                  {t.masterclassPage.curriculum}
                </a>
              </div>

              {/* Student Trust Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-4 border-t border-white/10">
                <div className="flex text-[#FFD447] text-sm">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-300">
                  <strong className="text-white text-sm">4.9/5</strong> • {language === 'am' ? 'በብዙ ሰልጣኞች የተመረጠ አካደሚ' : language === 'om' ? 'Hirmaattota hedduun kan filatame' : 'Joined by students across Ethiopia'}
                </span>
              </div>
            </div>

            {/* Right Card / Media Showcase */}
            <div className="relative flex items-center justify-center lg:justify-end mt-6 lg:mt-0">
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
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFD447] text-[#1C2951] flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition-transform group-hover:bg-white"
                  >
                    <FaPlayCircle />
                  </Link>
                </div>

                {/* Bottom Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-4 sm:p-5 rounded-2xl bg-[#0F172A]/85 backdrop-blur-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {language === 'am' ? 'የየነገ ማስተር ክላስ መግቢያ' : language === 'om' ? 'Seensa Mastaarkilaasii Yenege' : 'Yenege Masterclass Trailer'}
                      </h4>
                      <p className="text-[10px] font-semibold text-slate-400">
                        {language === 'am' ? 'የተረጋገጠ የስልጠና መርሃ-ግብር' : language === 'om' ? 'Qabiyyee Barnootaa Mirkanaaye' : 'Certified Event Curriculum'}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#FFD447]/10 text-[#FFD447] text-[10px] font-black uppercase tracking-wider border border-[#FFD447]/20">
                      {language === 'am' ? 'የተረጋገጠ' : language === 'om' ? 'Mirkanaayeera' : 'Verified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* ── Key Performance Stats Bar ──────────────────────────────────── */}
          <div className="mt-12 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { stat: "98%", label: t.masterclassPage.satisfaction, desc: t.masterclassPage.topRated },
              { stat: language === 'am' ? 'የተቀላቀለ' : language === 'om' ? 'Makuu' : 'Mixed', label: t.masterclassPage.practicalDrills, desc: t.masterclassPage.digitalLive },
              { stat: language === 'am' ? 'የተረጋገጠ' : language === 'om' ? 'Mirkanaaye' : 'Verified', label: t.masterclassPage.verifiedCerts, desc: t.masterclassPage.cvReady },
              { stat: "8 Wks", label: t.masterclassPage.programLength, desc: t.masterclassPage.cohortLength }
            ].map((item, index) => (
              <div key={index} className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col gap-1 hover:border-white/20 transition-all">
                <span className="font-heading text-2xl sm:text-4xl font-black bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] bg-clip-text text-transparent">{item.stat}</span>
                <span className="font-bold text-xs sm:text-sm text-white mt-1">{item.label}</span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY STUDY WITH US SECTION ───────────────────────────────────── */}
      <section className="py-16 sm:py-24 relative bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD447]/10 border border-[#FFD447]/30 text-[#FFD447] text-xs font-extrabold uppercase tracking-widest">
              {language === 'am' ? 'ለምን የነገ አካደሚን ይመርጣሉ?' : language === 'om' ? 'Maaliif Akaadaamii Yenege Filattu?' : 'Why Choose Yenege Academy'}
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
              {t.masterclassPage.whyChooseTitle}
            </h2>
            <p className="text-xs sm:text-base text-slate-400 font-medium max-w-2xl mx-auto">
              {t.masterclassPage.whyChooseSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {whyStudyUs.map((item, index) => (
              <div key={index} className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-[#FFD447]/40 hover:bg-white/[0.08] transition-all duration-300">
                <div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROGRAMS SECTION ──────────────────────────────────── */}
      <section id="courses" className="py-16 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <span className="text-xs font-black text-[#FFD447] uppercase tracking-[0.25em] block mb-2">
                {t.masterclassPage.featuredPrograms}
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-white">{t.masterclassPage.exploreTitle}</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">{t.masterclassPage.exploreSubtitle}</p>
            </div>
          </div>

          {/* Program Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-[#FFD447]/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#FFD447]/10 text-[#FFD447] text-[10px] font-black uppercase tracking-wider border border-[#FFD447]/20">
                    {language === 'am' ? 'ዋና ሰርተፍኬት' : language === 'om' ? 'Sertifiketiin Ijoo' : 'Master Certification'}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400">
                    {language === 'am' ? 'በአካል እና በኦንላይን' : language === 'om' ? 'Qaamaan fi Intarneetiin' : 'In-Person & Online'}
                  </span>
                </div>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-white mb-3">
                  {language === 'am' ? 'የኢቨንት አርክቴክቸር እና ፕሮዳክሽን አመራር' : language === 'om' ? 'Ijaarsa Qophii fi Dursoommaa Oomishaa' : 'Event Architecture & Production Leadership'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
                  {language === 'am' ? 'የኢቨንት ዲዛይን፣ በጀት አሰራር፣ የኮንትራክተር ድርድር፣ የቦታ አስተዳደር እና የቀጥታ ዝግጅት ቁጥጥርን ያካተተ ሙሉ ስልጠና።' : language === 'om' ? 'Leenjii guutuu diizayinii qophii, qophii bajataa, waliigaltee, bulchiinsa bakkaa fi to\'annoo qophii qabu.' : 'Comprehensive masterclass covering event design, budgeting, vendor negotiation, venue management, and on-ground crisis control.'}
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-300 mb-6">
                  <div className="flex items-center gap-2"><FaCheck className="text-[#FFD447]" /> {language === 'am' ? 'የተግባር ዝግጅት ልምምድን ያካተተ' : language === 'om' ? 'Shaakala qophii dhugaa kan qabu' : 'Includes Real Event Execution'}</div>
                  <div className="flex items-center gap-2"><FaCheck className="text-[#FFD447]" /> {t.masterclassPage.certifiedCohort}</div>
                  <div className="flex items-center gap-2"><FaCheck className="text-[#FFD447]" /> Telebirr &amp; CBE Payment Supported</div>
                </div>
              </div>

              <Link 
                to="/masterclass-registration" 
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] text-[#1C2951] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg"
              >
                {t.masterclassPage.enrollNow} <FaArrowRight />
              </Link>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-[#FFD447]/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#FF6F5E]/10 text-[#FF6F5E] text-[10px] font-black uppercase tracking-wider border border-[#FF6F5E]/20">
                    {language === 'am' ? 'ልዩ ዘርፍ' : language === 'om' ? 'Gosa Addaa' : 'Specialized Track'}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400">
                    {language === 'am' ? 'ሙሉ ኦንላይን' : language === 'om' ? 'Guutumaan Intarneetiin' : 'Full Online'}
                  </span>
                </div>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-white mb-3">
                  {language === 'am' ? 'የኢቨንት ማርኬቲንግ እና ስፖንሰርሺፕ ስትራቴጂ' : language === 'om' ? 'Miseensoma Qophii fi Toftaa Isponserii' : 'Event Marketing & Sponsorship Strategy'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
                  {language === 'am' ? 'ውጤታማ የፕሮፖዛል ዝግጅት፣ የስፖንሰርሺፕ ትብብር እና የቲኬት ሽያጭን የሚያስተምር ስልጠና።' : language === 'om' ? 'Waraqaa gaaffii isponserii qopheessuu, waliigaltee uumuu fi gurgurtaa tiikeetii leenji\'aa.' : 'Learn how to craft high-converting corporate proposals, secure sponsor partnerships, and drive ticket sales.'}
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-300 mb-6">
                  <div className="flex items-center gap-2"><FaCheck className="text-[#FF6F5E]" /> {language === 'am' ? 'የድርጅት ፕሮፖዛል ሞዴሎች' : language === 'om' ? 'Waraqaa gaaffii isponserii' : 'Corporate Proposal Templates'}</div>
                  <div className="flex items-center gap-2"><FaCheck className="text-[#FF6F5E]" /> {language === 'am' ? 'የዘላለም ተጠቃሚነት' : language === 'om' ? 'Fayyadamummaa Zalaalams' : 'Lifetime Access'}</div>
                  <div className="flex items-center gap-2"><FaCheck className="text-[#FF6F5E]" /> {t.masterclassPage.certifiedCohort}</div>
                </div>
              </div>

              <Link 
                to="/masterclass-registration" 
                className="w-full py-3.5 rounded-xl bg-white/10 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/15"
              >
                {t.masterclassPage.enrollNow} <FaArrowRight />
              </Link>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-[#FFD447]/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#7B5CFF]/10 text-[#7B5CFF] text-[10px] font-black uppercase tracking-wider border border-[#7B5CFF]/20">
                    {language === 'am' ? 'የአመራር ስልጠና' : language === 'om' ? 'Gosa Dursoommaa' : 'Executive Track'}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400">
                    {language === 'am' ? 'ሃይብሪድ (በአካል + ኦንላይን)' : language === 'om' ? 'Makuu (Qaamaan + Intarneetiin)' : 'Hybrid'}
                  </span>
                </div>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-white mb-3">
                  {language === 'am' ? 'የሰርግ እና የማህበራዊ ዝግጅቶች ዲዛይን' : language === 'om' ? 'Ijaarsa Muxannoo Cidha fi Qophii Hawaasaa' : 'Wedding & Social Experience Architecture'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
                  {language === 'am' ? 'የባለከፍተኛ ደረጃ ሰርግ ሎጂስቲክስ፣ የዲኮር ቅንጅት፣ የደንበኞች ግንኙነት እና የሰርግ ስነ-ስርዓት መሪነት።' : language === 'om' ? 'Lojistikii cidha sadarkaa olaanaa, qindoomina diikoraa fi raawwachiisa cidha leenji\'aa.' : 'Master luxury wedding logistics, high-end decor coordination, client communication, and seamless ceremony execution.'}
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-300 mb-6">
                  <div className="flex items-center gap-2"><FaCheck className="text-[#7B5CFF]" /> {language === 'am' ? 'የዲኮር እና የመድረክ ዲዛይን' : language === 'om' ? 'Diizayinii diikoraa fi waltajjii' : 'Hands-on Floral & Stage Design'}</div>
                  <div className="flex items-center gap-2"><FaCheck className="text-[#7B5CFF]" /> {language === 'am' ? 'የደንበኛ አስተዳደር መመሪያዎች' : language === 'om' ? 'Qajeelfama bulchiinsa maamilaa' : 'Client Management Worksheets'}</div>
                  <div className="flex items-center gap-2"><FaCheck className="text-[#7B5CFF]" /> {t.masterclassPage.certifiedCohort}</div>
                </div>
              </div>

              <Link 
                to="/masterclass-registration" 
                className="w-full py-3.5 rounded-xl bg-white/10 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/15"
              >
                {t.masterclassPage.enrollNow} <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS (FAQ) ───────────────────────────── */}
      <section className="py-16 sm:py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <span className="text-xs font-black text-[#FFD447] uppercase tracking-[0.25em] block">{t.masterclassPage.gotQuestions}</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">{t.masterclassPage.faqTitle}</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-xl transition-all">
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 sm:p-6 text-left font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 hover:bg-white/5"
                  >
                    <span>{faq.q}</span>
                    <FaChevronDown className={`transition-transform duration-300 text-[#FFD447] flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium border-t border-white/5 pt-4">
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
      <section className="py-16 sm:py-20 relative px-4 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-[2.5rem] sm:rounded-[3rem] bg-gradient-to-r from-[#1C2951] via-[#0F172A] to-[#1C2951] border border-white/20 p-8 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD447]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6 relative z-10 max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
              {t.masterclassPage.startLearningTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {t.masterclassPage.startLearningSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pt-4">
              <Link 
                to="/masterclass-registration" 
                className="w-full sm:w-auto bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] hover:from-[#ffe066] hover:to-[#ff8273] text-[#1C2951] font-black px-8 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#FF6F5E]/20 hover:scale-105 flex items-center justify-center gap-3"
              >
                {t.masterclassPage.enrollNow} <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Masterclass;
