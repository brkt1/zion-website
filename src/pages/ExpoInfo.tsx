import React, { useEffect } from 'react';
import { FiArrowRight, FiAward, FiCalendar, FiCamera, FiCheckCircle, FiHeart, FiLayout, FiMapPin, FiShoppingBag, FiSmartphone, FiStar, FiTruck, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';

// Assets
import heroImg from '../assets/expo/hero.png';
import pkg200kImg from '../assets/expo/package_200k.png';
import pkgCommonImg from '../assets/expo/package_common.png';
import vendorsImg from '../assets/expo/vendors.png';

const ExpoInfo: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const boothPackages = [
    {
      id: 'premium',
      title: 'Premium Platinum',
      size: '12m²',
      price: '200,000 ETB',
      image: pkg200kImg,
      slots: 'Only 6 Slots',
      features: [
        'Prime high-traffic locations',
        'Featured interview in Expo documentary',
        'Full page feature in Expo Guide',
        'Social media spotlight campaign',
        'VIP networking dinner access'
      ],
      popular: true,
      color: 'from-amber-100 to-amber-200'
    },
    {
      id: 'standard',
      title: 'Diamond Inline',
      size: '9m²',
      price: '100,000 ETB',
      image: pkgCommonImg,
      features: [
        'Strategic main row positioning',
        'Half page feature in Expo Guide',
        'Standard social media feature',
        'Booth furniture & lighting included',
        'Networking access'
      ],
      popular: false,
      color: 'from-slate-50 to-slate-100'
    },
    {
      id: 'shared',
      title: 'Creative Booth',
      size: '4m²',
      price: '75,000 ETB',
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
    }
  ];

  const vendorTypes = [
    { icon: <FiUsers />, label: 'Wedding Planners' },
    { icon: <FiLayout />, label: 'Decor & Rental' },
    { icon: <FiCamera />, label: 'Photo & Video' },
    { icon: <FiStar />, label: 'Makeup Artists' },
    { icon: <FiShoppingBag />, label: 'Bridal Designers' },
    { icon: <FiAward />, label: 'Jewelry Brands' },
    { icon: <FiSmartphone />, label: 'Catering Services' },
    { icon: <FiMapPin />, label: 'Hotels & Venues' },
    { icon: <FiTruck />, label: 'Honeymoon Travel' },
    { icon: <FiHeart />, label: 'Beauty & Wellness' }
  ];

  const yenegeYellow = "#FFD447";
  const coralOrange = "#FF6F5E";
  const indigoDeep = "#1C2951";

  return (
    <div className="bg-[#FAF9F6] text-[#1A1A1A] min-h-screen overflow-x-hidden transition-colors duration-700 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Manrope:wght@300;400;500;700;800&display=swap');

        .font-serif {
          font-family: 'Playfair Display', serif;
        }
        .font-sans {
          font-family: 'Manrope', sans-serif;
        }

        .glass-light {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04);
        }

        .hero-gradient-light {
          background: radial-gradient(circle at 50% 50%, rgba(255, 212, 71, 0.15) 0%, rgba(250, 249, 246, 0) 70%);
        }

        .text-gold-gradient {
          background: linear-gradient(135deg, ${yenegeYellow}, ${coralOrange});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .text-dark-gradient {
          background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
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

        .glow-button-light {
          background: linear-gradient(135deg, ${yenegeYellow} 0%, ${coralOrange} 100%);
          color: ${indigoDeep};
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 800;
        }

        .glow-button-light::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: 0.6s;
        }

        .glow-button-light:hover::after {
          left: 100%;
        }

        .luxury-border-light {
          position: relative;
          z-index: 1;
        }

        .luxury-border-light::after {
          content: '';
          position: absolute;
          inset: -1px;
          background: linear-gradient(45deg, ${yenegeYellow}, transparent, ${coralOrange});
          z-index: -1;
          border-radius: inherit;
          opacity: 0.3;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-40 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImg} 
            className="w-full h-full object-cover opacity-20" 
            alt="Wedding Expo background" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6]/40 via-[#FAF9F6]/80 to-[#FAF9F6]" />
          <div className="absolute inset-0 hero-gradient-light" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-block px-5 py-1.5 mb-8 border border-amber-500/20 rounded-full bg-amber-500/5 backdrop-blur-sm">
            <span className="text-amber-600 font-sans tracking-[0.4em] text-[10px] uppercase font-black">March 27–28 • Ghion Hotel</span>
          </div>
          
          <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl lg:text-9xl mb-8 leading-[1.1] text-slate-900 tracking-tight">
            Yene Ken <br />
            <span className="italic text-gold-gradient">Expo 2026</span>
          </h1>

          <p className="font-sans text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-14 font-medium leading-relaxed">
            The grandest gathering of luxury wedding artisans in Ethiopia. Elevate your brand in an atmosphere of pure elegance.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-20">
            <div className="flex items-center gap-5 glass-light px-10 py-5 rounded-[2rem] luxury-border-light">
              <FiCalendar className="text-amber-600 text-2xl" />
              <div className="text-left border-l border-amber-500/20 pl-5">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Schedule</p>
                <p className="font-bold text-slate-800 tracking-tight">መጋቢት 19-20</p>
              </div>
            </div>
            <div className="flex items-center gap-5 glass-light px-10 py-5 rounded-[2rem] luxury-border-light">
              <FiMapPin className="text-amber-600 text-2xl" />
              <div className="text-left border-l border-amber-500/20 pl-5">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Venue</p>
                <p className="font-bold text-slate-800 tracking-tight">GHION HOTEL</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/expo-registration" 
              className="glow-button-light w-full max-w-[280px] py-5 rounded-2xl font-sans font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-amber-900/10"
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
      <section className="py-32 relative bg-white/40">
        <div className="container mx-auto px-4 md:px-10 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative group">
              <div className="aspect-[4/5] rounded-[4rem] overflow-hidden luxury-border-light shadow-2xl">
                <img src={vendorsImg} className="w-full h-full object-cover grayscale opacity-90 md:grayscale md:opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" alt="Exhibitors" />
              </div>
              <div className="absolute -bottom-10 -right-10 glass-light p-10 rounded-[2.5rem] max-w-[320px] hidden md:block shadow-xl border border-white">
                <p className="font-serif italic text-3xl text-gold-gradient mb-3">"Pure Artistry."</p>
                <p className="font-sans text-sm text-slate-500 leading-relaxed font-medium">
                  We curate only the finest wedding designers, ensuring an environment of absolute sophistication for both vendors and visitors.
                </p>
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="h-[2px] w-12 bg-amber-500" />
                <span className="text-amber-600 font-sans tracking-[0.4em] uppercase text-xs font-black">The Vision</span>
              </div>
              <h2 className="font-serif text-5xl md:text-7xl leading-[1.1] text-slate-800 tracking-tight">Showcase Your <br/><span className="italic text-gold-gradient">Excellence.</span></h2>
              <p className="font-sans text-xl text-slate-500 leading-relaxed max-w-xl font-light">
                Secure your position in Ethiopia's premier luxury wedding marketplace. Connect with high-intent couples seeking the absolute best for their special day.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
                {vendorTypes.slice(0, 4).map((type, i) => (
                  <div key={i} className="flex items-center gap-5 group">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-all shadow-sm group-hover:shadow-amber-500/20">
                      <span className="text-2xl text-amber-600 group-hover:text-white transition-colors">{type.icon}</span>
                    </div>
                    <span className="font-sans font-bold text-slate-700 tracking-tight">{type.label}</span>
                  </div>
                ))}
              </div>

              <div className="pt-12">
                <a href="#packages" className="inline-flex items-center gap-3 text-amber-700 font-sans font-black uppercase text-xs tracking-widest hover:gap-6 transition-all">
                  Browse Booth Packages <FiArrowRight />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white border-y border-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { val: '5,000+', label: 'Elite Visitors' },
              { val: '120+', label: 'Luxury Brands' },
              { val: 'March', label: 'Summit 2026' },
              { val: '30M+', label: 'Social Echo' }
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <p className="font-serif text-5xl text-slate-800 tracking-tighter">{stat.val}</p>
                <div className="h-0.5 w-6 bg-amber-400 mx-auto" />
                <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black">{stat.label}</p>
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

          <div className="grid lg:grid-cols-3 gap-10">
            {boothPackages.map((pkg, idx) => (
              <div 
                key={idx}
                className={`group relative rounded-[3.5rem] bg-white transition-all duration-700 h-full flex flex-col ${
                  pkg.popular ? 'lg:-translate-y-8 shadow-[0_40px_100px_rgba(212,175,55,0.08)] ring-1 ring-amber-500/10' : 'hover:-translate-y-4 shadow-2xl shadow-slate-200/50'
                }`}
              >
                {/* Image Wrap */}
                <div className="h-80 relative overflow-hidden rounded-t-[3.5rem]">
                  <img src={pkg.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={pkg.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />
                  {pkg.slots && (
                    <div className="absolute top-8 right-8 bg-amber-500 text-white px-5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">
                      {pkg.slots}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-12 space-y-10 flex flex-col flex-grow">
                  <div className="space-y-3">
                    <h3 className="font-serif text-4xl text-slate-800 tracking-tight">{pkg.title}</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-px w-8 bg-amber-500/40" />
                      <p className="font-sans text-amber-700 font-black text-[10px] tracking-[0.2em] uppercase">{pkg.size} Luxury Module</p>
                    </div>
                  </div>

                  <div className="font-serif text-4xl text-slate-900 tracking-tighter">{pkg.price}</div>

                  <ul className="space-y-5 flex-grow">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm text-slate-500 font-medium">
                        <FiCheckCircle className="text-amber-500 mt-0.5 shrink-0" />
                        <span className="font-sans leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link 
                    to={`/expo-registration?booth=${pkg.id}`}
                    className={`block w-full py-6 rounded-[2rem] font-sans font-black text-xs tracking-widest uppercase transition-all text-center ${
                      pkg.popular 
                        ? 'glow-button-light shadow-xl shadow-amber-500/20' 
                        : 'bg-slate-50 text-slate-800 active:bg-slate-900 active:text-white'
                    }`}
                  >
                    Select {pkg.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Marquee */}
      <section className="py-24 bg-white border-y border-slate-50 overflow-hidden text-[#1A1A1A]">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...vendorTypes, ...vendorTypes].map((type, i) => (
            <div key={i} className="flex items-center gap-6 mx-8 md:mx-16">
              <span className="text-amber-600/30 text-2xl md:text-3xl">{type.icon}</span>
              <span className="font-serif italic text-3xl md:text-5xl text-slate-200">{type.label}</span>
              <div className="w-2 h-2 rounded-full bg-amber-500/10" />
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-40 relative">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto glass-light p-10 md:p-32 rounded-[4rem] md:rounded-[6rem] relative overflow-hidden luxury-border-light shadow-2xl border-white">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-amber-50/20 to-rose-50/20 opacity-40" />
            
            <div className="relative z-10 space-y-10">
              <div className="flex items-center justify-center gap-4 text-amber-600">
                <FiStar className="animate-pulse" />
                <span className="font-sans text-[10px] font-black tracking-[0.5em] uppercase">Limited Availability</span>
                <FiStar className="animate-pulse" />
              </div>
              
              <h2 className="font-serif text-5xl md:text-8xl text-slate-900 tracking-tighter leading-none">Your Spotlight <br /><span className="italic text-gold-gradient">Awaits.</span></h2>
              
              <p className="font-sans text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-light">
                Position your brand among the elite. Applications for the 2026 edition are strictly limited to ensure categorical exclusivity.
              </p>
              
              <div className="pt-12 flex flex-col md:flex-row items-center justify-center gap-8">
                <Link 
                  to="/expo-registration" 
                  className="w-full md:w-auto glow-button-light px-16 py-7 rounded-full font-sans font-black text-sm tracking-widest uppercase shadow-2xl shadow-slate-900/10 text-white"
                >
                  Apply to Exhibit
                </Link>
                <Link 
                  to="/contact" 
                  className="w-full md:w-auto px-16 py-7 rounded-full border border-slate-200 font-sans font-bold text-sm tracking-widest uppercase hover:bg-slate-50 transition-colors text-slate-600"
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
          to="/expo-registration" 
          className="glow-button-light flex items-center justify-center gap-4 py-5 rounded-2xl shadow-2xl shadow-amber-500/30 font-sans font-black text-sm tracking-widest uppercase transition-transform active:scale-95"
        >
          Secure Your Space <FiArrowRight className="text-lg" />
        </Link>
      </div>
    </div>
  );
};

export default ExpoInfo;
