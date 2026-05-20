import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCrown, FaUsers, FaHandshake, FaChartBar, FaChevronDown, FaCheckCircle, FaUserCheck } from 'react-icons/fa';

export default function YenegeUnityLanding() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Decorative Glow Elements */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-yellow-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
              <FaCrown className="animate-pulse" /> በግብዣ ብቻ የሚገቡበት የንግድ ትስስር መድረክ
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              የድርጅትዎን ገበያ እና ግንኙነት የሚያሳድጉበት <br />
              <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                ልዩ ስነ-ምህዳር
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              የነገ ዩኒቲ (YENEGE UNITY) በየ 15 ቀኑ በአዲስ አበባ የሚካሄድ፣ አቅራቢዎችን (Vendors)፣ ነጋዴዎችን እና የድርጅት ባለቤቶችን በቀጥታ ከገዢዎች እና ከባለሀብቶች ጋር የሚያገናኝ ዘመናዊ የንግድ መድረክ ነው። እዚህ መድረክ ላይ ንግግር የለም፤ ሰዓትዎን የሚያባክን ነገር የለም፤ የሚደረገው ቀጥተኛ የንግድ ትስስር ብቻ ነው።
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                to="/yenege-unity/apply"
                className="px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black rounded-xl text-center shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-amber-300"
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

            <div className="grid grid-cols-3 gap-6 pt-8 max-w-md mx-auto lg:mx-0 border-t border-white/10">
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-amber-400">50</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">ተሳታፊዎች ብቻ</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-amber-400">15</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">በየ ቀኑ</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-amber-400">1-ለ-1</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">ቀጥተኛ ትስስር</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative group max-w-md w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000" />
              <div className="relative bg-neutral-950 border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/yenege_unity_hero.png" 
                  alt="Yenege Unity Premium Networking" 
                  className="w-full h-80 object-cover opacity-90 object-top"
                />
                <div className="p-6 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-400">አዲስ አበባ, ኢትዮጵያ</p>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">የድርጅት መሪዎች መድረክ</h3>
                  <p className="text-sm text-gray-400">
                    በየ 15 ቀኑ በጥንቃቄ የሚመረጡ 50 የድርጅት መሪዎች እና አቅራቢዎች ብቻ።
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Intro Section */}
      <section className="bg-neutral-950 border-y border-white/5 py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              ከተለመዱት ስብሰባዎች በተለየ መልኩ የተዋቀረ
            </h2>
            <p className="text-gray-400 leading-relaxed font-light mb-4">
              በተለመዱት የንግድ ስብሰባዎች ላይ አዳራሽ ውስጥ ተቀምጦ ንግግር መስማት እንጂ ትክክለኛውን ደንበኛ በአጋጣሚ ማግኘት ከባድ ነው። እኛ ጋር አሰራሩ ፍጹም የተለያየ ነው፡
            </p>
            <p className="text-gray-400 leading-relaxed font-light">
              እርስዎ ከመጡ በኋላ ደንበኛ አይፈልጉም፤ እኛ አስቀድመን የእርስዎን የስራ ዘርፍ እና ማግኘት የሚፈልጉትን የሰው አይነት በማጥናት፣ ሊገናኙዋቸው ከሚገቡ 3 እና 4 ዋና ዋና ሰዎች ጋር አስቀድመን ቀጠሮ እናዘጋጅልዎታለን።
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-black border border-white/10 rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                <FaCrown size={20} />
              </div>
              <h4 className="font-bold text-lg">ቅድመ-ጥናት</h4>
              <p className="text-sm text-gray-500">የእርስዎን የስራ ዘርፍ እና ማግኘት የሚፈልጉትን የሰው አይነት አስቀድመን እናጠናለን።</p>
            </div>
            <div className="p-6 bg-black border border-white/10 rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                <FaUsers size={20} />
              </div>
              <h4 className="font-bold text-lg">ቀጥተኛ ትስስር</h4>
              <p className="text-sm text-gray-500">ሊገናኙዋቸው ከሚገቡ ዋና ዋና ሰዎች ጋር አስቀድመን ቀጠሮ እናዘጋጅልዎታለን።</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">ለእናንተ የሚኖረው ጥቅም</h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-light">
            ለንግድዎ የሚገኝ እውነተኛ ትርፍ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-neutral-900/50 border border-white/10 rounded-3xl space-y-4 hover:border-amber-500/40 transition-colors duration-300">
            <FaHandshake className="text-amber-400 text-4xl" />
            <h3 className="text-xl font-bold">ቀጥተኛ ደንበኛ ማግኘት</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              ምርት እና አገልግሎትዎን ለትልልቅ ኩባንያዎች ውሳኔ ሰጪዎች በቀጥታ የማስተዋወቅ እና የመሸጥ እድል።
            </p>
          </div>
          <div className="p-8 bg-neutral-900/50 border border-white/10 rounded-3xl space-y-4 hover:border-amber-500/40 transition-colors duration-300">
            <FaChartBar className="text-amber-400 text-4xl" />
            <h3 className="text-xl font-bold">የተለያዩ ዘርፎች ትስስር</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              የቴክኖሎጂ ባለሙያዎችን፣ የፋይናንስ ሰዎችን፣ የግብርና ምርት ላኪዎችን እና የማምረቻ ኢንዱስትሪዎችን በአንድ ቦታ ያግኙ።
            </p>
          </div>
          <div className="p-8 bg-neutral-900/50 border border-white/10 rounded-3xl space-y-4 hover:border-amber-500/40 transition-colors duration-300">
            <FaUserCheck className="text-amber-400 text-4xl" />
            <h3 className="text-xl font-bold">ስትራቴጂያዊ አቀማመጥ</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              የምሳ እና የኮክቴል ጠረጴዛዎች የሚዘጋጁት የእርስዎን የንግድ ፍላጎት መሰረት አድርጎ አስቀድሞ በተጠና አቀማመጥ ነው።
            </p>
          </div>
        </div>
      </section>

      {/* Networking Opportunities - Industry Targets Showcase */}
      <section className="bg-neutral-950 border-t border-white/5 py-24 px-4 md:px-8" id="agenda">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                ለመሳተፍ ምን መደረግ አለበት?
              </h2>
              <p className="text-gray-400 leading-relaxed font-light">
                በቀላሉ በ 3 ደረጃዎች የሚጠናቀቅ ሂደት
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <FaCheckCircle className="text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-white">ፈጣን አሰራር</h5>
                    <p className="text-xs text-gray-500">በጥቂት ደቂቃዎች ውስጥ ማመልከቻዎን ማስገባት ይችላሉ።</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <FaCheckCircle className="text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-white">ግልጽ የሆነ ጥቅም</h5>
                    <p className="text-xs text-gray-500">ቀጥተኛ ደንበኛ ማግኘት የሚያስችል መድረክ።</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 bg-black border border-white/10 p-6 md:p-8 rounded-3xl space-y-6">
              <h4 className="font-bold text-amber-400 uppercase tracking-widest text-xs">የአሰራር ሂደት (Simple 3-Step Flow)</h4>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold flex-shrink-0 text-sm">1</div>
                  <div>
                    <h5 className="font-bold text-white">ቅጹን ይሙሉ (Submit Intake)</h5>
                    <p className="text-sm text-gray-400 mt-1">የሚሰሩትን ስራ፣ የሚሸጡትን ምርት/አገልግሎት እና ማግኘት የሚፈልጉትን የደንበኛ አይነት በቅጹ ላይ ይግለጹ።</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold flex-shrink-0 text-sm">2</div>
                  <div>
                    <h5 className="font-bold text-white">አስቀድሞ ማዘጋጀት (Matchmaking)</h5>
                    <p className="text-sm text-gray-400 mt-1">የእኛ የክሊየንት ቡድን የእርስዎን መረጃ በማጥናት፣ በዕለቱ አብረዋቸው ሊቀመጡ የሚገቡትን ተስማሚ ነጋዴዎች ይመድባል።</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold flex-shrink-0 text-sm">3</div>
                  <div>
                    <h5 className="font-bold text-white">የቀጠሮ አጀንዳዎን ይቀበሉ (Your Agenda)</h5>
                    <p className="text-sm text-gray-400 mt-1">ወደ አዳራሹ ከመግባትዎ በፊት፣ ከማን ጋር እንደሚቀመጡ እና ምን አይነት የንግድ ውይይት እንደሚያደርጉ የሚገልጽ የራስዎን ፕሮግራም በእጅዎ ይደርሰዎታል።</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-neutral-900/40 border-t border-white/5 py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">የአጋሮቻችን ድምፅ</h2>
          </div>
          <div className="max-w-3xl mx-auto p-8 bg-black border border-white/10 rounded-3xl space-y-4">
            <p className="italic text-gray-300 text-lg leading-relaxed text-center">
              "ሌላ ተራ ስብሰባ መስሎኝ ነበር። ነገር ግን የነገ ዩኒቲ የእኔን የሎጅስቲክስ አገልግሎት የሚፈልጉ ሁለት ትልልቅ የግብርና ምርት ላኪዎችን በቀጥታ አገናኘኝ። በሶስት ሳምንት ውስጥ ውል ተፈራረምን።"
            </p>
            <div className="text-center mt-6">
              <p className="font-bold text-amber-400 text-lg">ቴዎድሮስ ካሳሁን</p>
              <p className="text-sm text-gray-500">የካሳሁን ሳፕላይ ቼይን ዋና ስራ አስፈጻሚ</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 md:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">በተደጋጋሚ የሚነሱ ጥያቄዎች</h2>
          <p className="text-gray-400 text-sm">ስለ ነገ ዩኒቲ እና ስለ አሰራራችን ማወቅ ያለብዎት</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-white hover:bg-neutral-850"
              >
                <span>{faq.q}</span>
                <FaChevronDown className={`text-amber-500 transition-transform duration-300 flex-shrink-0 ${activeFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === index && (
                <div className="px-6 pb-6 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer Application CTA */}
      <section className="border-t border-white/10 bg-gradient-to-b from-neutral-950 to-black py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">የቀጣዩ ዝግጅት ተሳታፊ ይሁኑ</h2>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto font-light">
            የዝግጅቱን ጥራት ለመጠበቅ በየዙሩ መሳተፍ የሚችሉት 50 ድርጅቶች ብቻ ናቸው። አሁኑኑ ቦታዎን ያስይዙ።
          </p>
          <div className="pt-4 pb-12 border-b border-white/10 mb-8">
            <Link
              to="/yenege-unity/apply"
              className="inline-block px-10 py-5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black rounded-2xl text-lg shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-amber-300"
            >
              ለመሳተፍ ማመልከቻ ያስገቡ
            </Link>
          </div>
          
          {/* Custom Footer inside Landing Page */}
          <div className="pt-8 flex flex-col items-center gap-4 text-sm text-gray-500">
             <div className="font-bold text-white text-lg tracking-widest mb-2">YENEGE UNITY</div>
             <p className="text-gray-400">የኢትዮጵያን ቀጣይ ትውልድ የንግድ ስነ-ምህዳር መገንባት።</p>
             
             <div className="flex flex-col md:flex-row gap-6 md:gap-12 mt-4 items-center justify-center">
               <div className="flex items-center gap-2">
                 <span className="text-amber-500">ኢሜይል:</span> yenegeevents@gmail.com
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-amber-500">ስልክ / ዋትስአፕ:</span> +251 978 639 887
               </div>
             </div>
             
             <p className="max-w-lg mx-auto text-center mt-4">
                <span className="text-amber-500">አድራሻ:</span> አሚር ኮሜርሻል ኮምፕሌክስ፣ 12ኛ ፎቅ፣ ቢሮ ቁጥር 12-003፣ ጋቦን ጎዳና (ኦሊምፒያ)፣ ቦሌ ክፍለ ከተማ፣ አዲስ አበባ፣ ኢትዮጵያ።
             </p>
             
             <div className="mt-8 pt-8 border-t border-white/10 w-full text-center">
                © 2026 YENEGE. መብቱ በህግ የተጠበቀ ነው።
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
