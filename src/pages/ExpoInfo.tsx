import React, { useEffect } from 'react';
import { FiArrowRight, FiAward, FiCalendar, FiCamera, FiCheckCircle, FiHeart, FiLayout, FiMapPin, FiShoppingBag, FiSmartphone, FiStar, FiTruck, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';

// Assets
import heroImg from '../assets/expo/hero.png';
import pkg200kImg from '../assets/expo/package_200k.png';
import pkg40kImg from '../assets/expo/package_40k.png';
import pkgCommonImg from '../assets/expo/package_common.png';
import vendorsImg from '../assets/expo/vendors.png';
import zionLogoImg from '../assets/expo/zion-logo.png';

const ExpoInfo: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const boothPackages = [
    {
      id: 'shared',
      title: 'Creative Booth',
      size: '4m²',
      price: '50,000 ETB',
      pricePerDay: '25,000 ETB',
      image: pkgCommonImg,
      features: [
        'Perfect for startups & designers',
        'Company listing in Expo Guide',
        'Access to vendor networking hub',
        'General event security',
        'Entry-level visibility'
      ],
      popular: false,
      color: 'from-slate-50 to-slate-100'
    },
    {
      id: 'standard',
      title: 'Diamond Inline',
      size: '9m²',
      price: '100,000 ETB',
      pricePerDay: '50,000 ETB',
      image: pkgCommonImg,
      features: [
        'Strategic main row positioning',
        'Half page feature in Expo Guide',
        'Standard social media feature',
        'Booth furniture & lighting included',
        'Networking access'
      ],
      popular: true,
      color: 'from-slate-50 to-slate-100'
    },
    {
      id: 'premium',
      title: 'Premium Platinum',
      size: '12m²',
      price: '200,000 ETB',
      pricePerDay: '100,000 ETB',
      image: pkg200kImg,
      slots: 'Only 6 Slots',
      features: [
        'Prime high-traffic locations',
        'Featured interview in Expo documentary',
        'Full page feature in Expo Guide',
        'Social media spotlight campaign',
        'VIP networking dinner access'
      ],
      popular: false,
      color: 'from-amber-100 to-amber-200'
    },
    {
      id: 'artisan',
      title: 'Artisan Studio',
      size: '3m²',
      price: '40,000 ETB',
      pricePerDay: '20,000 ETB',
      image: pkg40kImg,
      features: [
        'Recommended for Artists',
        'Optimized for Makeup & Visual artists',
        'Company listing in Expo Guide',
        'Power outlet & lighting included',
        'Dedicated branding wall',
        'Direct access to visual hub'
      ],
      popular: false,
      color: 'from-slate-50 to-slate-100'
    }
  ];

  const vendorTypes = [
    { icon: <FiUsers />, label: 'Wedding Planners' },
    { icon: <FiLayout />, label: 'Decor & Rental' },
    { icon: <FiStar />, label: 'Makeup Artists' },
    { icon: <FiShoppingBag />, label: 'Bridal Designers' },
    { icon: <FiAward />, label: 'Jewelry Brands' },
    { icon: <FiSmartphone />, label: 'Catering Services' },
    { icon: <FiMapPin />, label: 'Hotels & Venues' },
    { icon: <FiTruck />, label: 'Honeymoon Travel' },
    { icon: <FiHeart />, label: 'Beauty & Wellness' },
    { icon: <FiCamera />, label: 'Photo & Video' }
  ];

  const yenegeYellow = "#E4E821";
  const coralOrange = "#FF6F5E";
  const indigoDeep = "#1C2951";

  return (
    <div className="bg-[#0F172A] text-white min-h-screen overflow-x-hidden transition-colors duration-700 font-sans">
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

        .glass-dark {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .hero-glow {
          background: radial-gradient(circle at 50% 50%, rgba(255, 212, 71, 0.05) 0%, transparent 70%);
        }

        .text-gold-gradient {
          background: linear-gradient(135deg, ${yenegeYellow}, #FF6F5E);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .glow-button {
          background: ${yenegeYellow};
          color: #0F172A;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .glow-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(255, 212, 71, 0.3);
          filter: brightness(1.1);
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }

        @media (max-width: 768px) {
          .sidebrand { display: none; }
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-40 pb-20 overflow-hidden">
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
          EXHIBIT
        </div>
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImg} 
            className="w-full h-full object-cover opacity-10 grayscale" 
            alt="Wedding Expo background" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/40 via-[#0F172A]/80 to-[#0F172A]" />
          <div className="absolute inset-0 hero-glow" />
          <div className="noise-bk" />
        </div>
        <div className="sidebrand">YENE KEN EXPO 2026</div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-block px-5 py-1.5 mb-8 border border-amber-500/20 rounded-full bg-amber-500/5 backdrop-blur-sm">
            <span className="text-amber-600 font-sans tracking-[0.4em] text-[10px] uppercase font-black">መጋቢት 19-20 • Ghion Hotel</span>
          </div>
          
          <div className="flex flex-col items-center justify-center mb-6">
            <span className="text-slate-500 font-sans text-[10px] uppercase tracking-[0.3em] font-black mb-3">Promoted By</span>
            <img src={zionLogoImg} alt="Promoter" className="w-32 sm:w-40 md:w-48 object-contain drop-shadow-xl" />
          </div>
          
          <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl lg:text-9xl mb-8 leading-[1.1] text-white tracking-tight">
            Yene Ken <br />
            <span className="italic text-gold-gradient">Expo 2026</span>
          </h1>

          <p className="font-sans text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-14 font-medium leading-relaxed">
            The grandest gathering of luxury wedding artisans in Ethiopia. Elevate your brand in an atmosphere of pure elegance.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-20">
            <div className="flex items-center gap-5 glass-dark px-10 py-5 rounded-[2rem] border border-white/5">
              <FiCalendar className="text-[#E4E821] text-2xl" />
              <div className="text-left border-l border-white/10 pl-5">
                <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Schedule</p>
                <p className="font-bold text-white tracking-tight">መጋቢት 19-20</p>
              </div>
            </div>
            <div className="flex items-center gap-5 glass-dark px-10 py-5 rounded-[2rem] border border-white/5">
              <FiMapPin className="text-[#E4E821] text-2xl" />
              <div className="text-left border-l border-white/10 pl-5">
                <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Venue</p>
                <p className="font-bold text-white tracking-tight">GHION HOTEL</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/expo-registration?booth=standard" 
              className="glow-button w-full max-w-[280px] py-5 rounded-2xl font-sans font-black text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
            >
              Become an Exhibitor <FiArrowRight className="text-lg" />
            </Link>
          </div>
        </div>

        {/* Floating elements decoration */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-amber-200/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-rose-100/30 rounded-full blur-[100px] animate-float opacity-70" style={{ animationDelay: '3s' }} />
      </section>

      {/* About Section */}
      <section className="py-32 relative bg-[#0F172A] overflow-hidden">
        <div className="noise-bk" />
        <div className="container mx-auto px-4 md:px-10 lg:px-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative group">
              <div className="aspect-[4/5] rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
                <img src={vendorsImg} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" alt="Exhibitors" />
              </div>
              <div className="absolute -bottom-10 -right-10 glass-dark p-10 rounded-[2.5rem] max-w-[320px] hidden md:block shadow-xl border border-white/10">
                <p className="font-serif italic text-3xl text-gold-gradient mb-3">"Pure Artistry."</p>
                <p className="font-sans text-sm text-white/40 leading-relaxed font-medium">
                  We curate only the finest wedding designers, ensuring an environment of absolute sophistication for both vendors and visitors.
                </p>
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="h-[2px] w-12 bg-[#E4E821]" />
                <span className="text-[#E4E821] font-sans tracking-[0.4em] uppercase text-xs font-black">The Vision</span>
              </div>
              <h2 className="font-serif text-5xl md:text-7xl leading-[1.1] text-white tracking-tight">Showcase Your <br/><span className="italic text-gold-gradient">Excellence.</span></h2>
              <p className="font-sans text-xl text-white/40 leading-relaxed max-w-xl font-light">
                Secure your position in Ethiopia's premier luxury wedding marketplace. Connect with high-intent couples seeking the absolute best for their special day.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
                {vendorTypes.slice(0, 4).map((type, i) => (
                  <div key={i} className="flex items-center gap-5 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#E4E821] group-hover:border-[#E4E821] transition-all shadow-sm">
                      <span className="text-2xl text-white/40 group-hover:text-[#0F172A] transition-colors">{type.icon}</span>
                    </div>
                    <span className="font-sans font-bold text-white/60 tracking-tight group-hover:text-white transition-colors">{type.label}</span>
                  </div>
                ))}
              </div>

              <div className="pt-12">
                <a href="#packages" className="inline-flex items-center gap-3 text-[#E4E821] font-sans font-black uppercase text-xs tracking-widest hover:gap-6 transition-all">
                  Browse Booth Packages <FiArrowRight />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-[#0F172A] border-y border-white/5 relative overflow-hidden">
        <div className="noise-bk" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { val: '800 - 1000', label: 'Elite Visitors' },
              { val: '120+', label: 'Luxury Brands' },
              { val: 'መጋቢት', label: 'Summit 2026' },
              { val: '30M+', label: 'Social Echo' }
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <p className="font-serif text-5xl text-white tracking-tighter">{stat.val}</p>
                <div className="h-0.5 w-6 bg-[#E4E821] mx-auto" />
                <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/20 font-black">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <span className="text-amber-600 font-sans tracking-[0.5em] uppercase text-[10px] font-black">Curation Tiers</span>
            <h2 className="font-serif text-5xl md:text-8xl mt-6 mb-8 text-slate-900 leading-tight tracking-tight">Tiered <span className="italic text-gold-gradient">Experiences</span></h2>
            <p className="font-sans text-slate-500 text-lg font-medium leading-relaxed">Each space is architected to maximize your brand's presence and facilitate seamless connections.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {boothPackages.map((pkg, idx) => (
              <div 
                key={idx}
                className={`group relative rounded-[4rem] bg-white/5 border border-white/10 transition-all duration-700 flex flex-col ${
                  pkg.popular ? 'shadow-[0_40px_100px_rgba(255,212,71,0.15)] border-[#E4E821]/40' : 'hover:bg-white/[0.08]'
                }`}
              >
                {/* Image Wrap - Larger & Clearer */}
                <div className="h-[450px] sm:h-[550px] relative overflow-hidden rounded-[4rem] p-4">
                  <div className="w-full h-full relative overflow-hidden rounded-[3.2rem]">
                    <img 
                      src={pkg.image} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100" 
                      alt={pkg.title} 
                    />
                    {/* Minimalist Overlay for depth only at extreme bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
                    
                    {/* Floating Price Badge */}
                    <div className="absolute top-8 left-8 glass-dark px-8 py-4 rounded-3xl border border-white/10 shadow-2xl">
                      <p className="text-[10px] uppercase tracking-widest font-black text-[#E4E821] mb-1">Starting from</p>
                      <div className="flex items-baseline gap-1">
                        <p className="font-serif text-4xl text-white tracking-tighter">{pkg.pricePerDay.split(' ')[0]}</p>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-tighter">ETB / Day</p>
                      </div>
                      <p className="text-[9px] text-white/20 font-medium uppercase tracking-tight mt-1">Full Position: {pkg.price}</p>
                    </div>

                    {pkg.slots && (
                      <div className="absolute top-8 right-8 bg-[#E4E821] text-[#0F172A] px-6 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-xl animate-pulse">
                        {pkg.slots}
                      </div>
                    )}

                    {/* Quick Specs Overlay */}
                    <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between">
                      <div className="glass-dark backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                         <span className="font-sans font-black text-xs text-white tracking-widest uppercase">{pkg.size} Premium Space</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-12 pb-16 space-y-10 flex flex-col flex-grow">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-[2px] w-12 bg-[#E4E821]" />
                        <span className="text-[#E4E821] font-sans tracking-[0.4em] uppercase text-[10px] font-black">Luxury Module</span>
                      </div>
                      <h3 className="font-serif text-5xl md:text-6xl text-white tracking-tighter leading-none">{pkg.title}</h3>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6 flex-grow">
                    {pkg.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                          <FiCheckCircle className="text-[#E4E821] size={14}" />
                        </div>
                        <span className="font-sans text-sm text-white/40 font-medium leading-snug">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link 
                    to={`/expo-registration?booth=${pkg.id}`}
                    className={`block w-full py-7 rounded-3xl font-sans font-black text-[10px] tracking-[0.3em] uppercase transition-all text-center shadow-xl ${
                      pkg.popular 
                        ? 'glow-button shadow-[#E4E821]/20' 
                        : 'bg-white text-[#0F172A] hover:bg-white/90'
                    }`}
                  >
                    Request {pkg.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>


        </div>
      </section>

      {/* Founder Message Section */}
      <section className="py-32 bg-[#0F172A] relative overflow-hidden">
        <div className="noise-bk" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5 relative">
                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden luxury-border-light shadow-2xl">
                  {/* High quality professional headshot placeholder */}
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
                    alt="Bereket Yosef - Founder" 
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-8 -right-8 glass-dark p-8 rounded-[2rem] border border-white/10 shadow-xl">
                  <h4 className="font-serif italic text-2xl text-white">Founder's Note</h4>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-[2px] w-12 bg-[#E4E821]" />
                    <span className="text-[#E4E821] font-sans tracking-[0.4em] uppercase text-[10px] font-black">Curator's Vision</span>
                  </div>
                  <h2 className="font-serif text-5xl md:text-7xl text-white tracking-tight leading-none">
                    Elegance is in <br />
                    <span className="italic text-gold-gradient">The Detail.</span>
                  </h2>
                </div>

                <div className="space-y-6 text-xl text-white/40 font-light leading-relaxed italic">
                  <p>
                    "Yene Ken Expo belongs to those who believe that a wedding is more than an event—it's a masterpiece. We've created this ecosystem to celebrate the artisans who transform dreams into reality with absolute precision."
                  </p>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <p className="font-serif text-3xl text-white tracking-tight">Bereket Yosef</p>
                  <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#E4E821] font-black mt-2">CEO & Lead Curator, Yenege</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background text */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[20rem] font-serif font-black text-white/[0.02] select-none pointer-events-none -z-1 translate-x-[-10%] whitespace-nowrap">
          YENEGE
        </div>
      </section>

      {/* Categories Marquee */}
      <section className="py-24 bg-[#0F172A] border-y border-white/5 overflow-hidden text-white/10">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...vendorTypes, ...vendorTypes].map((type, i) => (
            <div key={i} className="flex items-center gap-6 mx-8 md:mx-16">
              <span className="text-[#E4E821]/10 text-2xl md:text-3xl">{type.icon}</span>
              <span className="font-serif italic text-3xl md:text-5xl text-white/5">{type.label}</span>
              <div className="w-2 h-2 rounded-full bg-[#E4E821]/5" />
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-40 relative overflow-hidden">
        <div className="noise-bk" />
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto glass-dark p-10 md:p-32 rounded-[4rem] md:rounded-[6rem] relative overflow-hidden border border-white/5 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-40" />
            
            <div className="relative z-10 space-y-10">
              <div className="flex items-center justify-center gap-4 text-[#E4E821]">
                <FiStar className="animate-pulse" />
                <span className="font-sans text-[10px] font-black tracking-[0.5em] uppercase">Limited Availability</span>
                <FiStar className="animate-pulse" />
              </div>
              
              <h2 className="font-serif text-5xl md:text-8xl text-white tracking-tighter leading-none">Your Spotlight <br /><span className="italic text-gold-gradient">Awaits.</span></h2>
              
              <p className="font-sans text-xl text-white/40 max-w-2xl mx-auto leading-relaxed font-light">
                Position your brand among the elite. Applications for the 2026 edition are strictly limited to ensure categorical exclusivity.
              </p>
              
              <div className="pt-12 flex flex-col md:flex-row items-center justify-center gap-8">
                <Link 
                  to="/expo-registration" 
                  className="w-full md:w-auto glow-button px-16 py-7 rounded-full font-sans font-black text-[10px] tracking-widest uppercase shadow-2xl shadow-slate-900/10"
                >
                  Apply to Exhibit
                </Link>
                <Link 
                  to="/contact" 
                  className="w-full md:w-auto px-16 py-7 rounded-full border border-white/10 font-sans font-black text-[10px] tracking-widest uppercase hover:bg-white/5 transition-colors text-white/60"
                >
                  Concierge Desk
                </Link>
              </div>

              <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-10 opacity-20">
                <FiTruck className="text-3xl mx-auto" />
                <FiCamera className="text-3xl mx-auto" />
                <FiUsers className="text-3xl mx-auto" />
                <FiAward className="text-3xl mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Floating Button - Integrated UX */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 hidden md:block">
        <Link 
          to="/expo-registration?booth=standard" 
          className="glow-button flex items-center justify-center gap-4 py-5 rounded-2xl shadow-2xl shadow-amber-500/30 font-sans font-black text-[10px] tracking-widest uppercase transition-transform active:scale-95"
        >
          Secure Your Space <FiArrowRight className="text-lg" />
        </Link>
      </div>
    </div>
  );
};

export default ExpoInfo;
