import { useEffect } from "react";
import { FaArrowRight, FaHandshake, FaHeart, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";

const Community = () => {
  // Update page title and meta tags for SEO
  useEffect(() => {
    document.title = "Community | Yenege";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Yenege - Join our vibrant community. Share stories, connect, and build lasting friendships with like-minded people.');
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Community | Yenege');
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 'Yenege - Join our vibrant community. Share stories, connect, and build lasting friendships with like-minded people.');
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', window.location.href);
    }
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', 'Community | Yenege');
    }
    
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', 'Yenege - Join our vibrant community. Share stories, connect, and build lasting friendships with like-minded people.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile App-like Sticky Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 py-3">
          <h1 
            className="text-xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Community
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Connect and build friendships
          </p>
        </div>
      </div>

      {/* Header Section - Desktop */}
      <section className="hidden md:block pt-24 md:pt-32 pb-12 md:pb-24 lg:pb-32 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4 md:mb-8">
              <div 
                className="h-1 w-20 md:w-24 mx-auto mb-4 md:mb-6 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-8 tracking-tight px-2">
              <span 
                className="block"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Community
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Join a vibrant community of happy people. Share stories, connect, and build lasting friendships.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-4 md:py-12 lg:py-24 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 md:px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="group relative overflow-hidden rounded-xl md:rounded-2xl lg:rounded-[2rem] p-4 md:p-8 lg:p-12 xl:p-16 transition-all duration-700"
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 248, 240, 0.9) 100%)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 212, 71, 0.1)",
              }}
              onMouseEnter={(e) => {
                if (window.innerWidth >= 768) {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 30px 80px rgba(255, 111, 94, 0.15), 0 0 0 1px rgba(255, 212, 71, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 212, 71, 0.1)";
              }}
            >
              {/* Animated gradient background */}
              <div 
                className="absolute top-0 right-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                style={{
                  background: "radial-gradient(circle, rgba(255, 212, 71, 0.3) 0%, rgba(255, 111, 94, 0.3) 100%)",
                  transform: "translate(30%, -30%)",
                }}
              />

              <div className="relative z-10">
                {/* Decorative line */}
                <div 
                  className="h-0.5 sm:h-1 w-16 sm:w-20 md:w-24 mb-4 sm:mb-6 md:mb-8 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                  }}
                ></div>

                <h2 
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 tracking-tight"
                  style={{
                    background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Building Connections, Creating Happiness
                </h2>
                <div className="space-y-4 sm:space-y-5 md:space-y-6 text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed font-light">
                  <p>
                    At Yenege, we believe that the best experiences are shared. Our community is a vibrant, welcoming space where people from all walks of life come together to celebrate, explore, and grow.
                  </p>
                  <p>
                    Whether you're attending events, going on adventures, or simply connecting with like-minded individuals, you'll find a supportive network of friends who share your passion for living life to the fullest. Join us and become part of something special!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-6 md:py-12 lg:py-24 relative overflow-hidden bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-6 md:mb-12 lg:mb-20">
            <div className="inline-block mb-3 md:mb-6">
              <div 
                className="h-0.5 md:h-1 w-12 md:w-20 mx-auto mb-2 md:mb-4 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
            </div>
            <h2 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-6 tracking-tight px-4">
              <span 
                className="block"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Why Join Our Community?
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: FaUsers,
                title: "Meet Amazing People",
                description: "Connect with individuals who share your interests and values. Build meaningful relationships that extend beyond events.",
              },
              {
                icon: FaHeart,
                title: "Share Your Stories",
                description: "Be part of a community where everyone's voice matters. Share your experiences and inspire others.",
              },
              {
                icon: FaHandshake,
                title: "Build Lasting Friendships",
                description: "Create bonds that last a lifetime. Our community is built on genuine connections and mutual support.",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl md:rounded-2xl lg:rounded-[2rem] p-4 md:p-8 lg:p-10 transition-all duration-700 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 240, 0.95) 100%)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 212, 71, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    if (window.innerWidth >= 768) {
                      e.currentTarget.style.transform = "translateY(-12px) scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 25px 60px rgba(255, 111, 94, 0.2), 0 0 0 1px rgba(255, 212, 71, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 212, 71, 0.1)";
                  }}
                >
                  {/* Animated gradient background */}
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                    style={{
                      background: `linear-gradient(135deg, rgba(255, 212, 71, 0.4) 0%, rgba(255, 111, 94, 0.4) 100%)`,
                      transform: "translate(30%, -30%)",
                    }}
                  />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 transition-all duration-500 group-hover:scale-110"
                      style={{
                        background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                      }}
                    >
                      <Icon size={32} className="text-white" />
                    </div>

                    {/* Decorative line */}
                    <div 
                      className="h-0.5 sm:h-1 w-10 sm:w-12 md:w-16 mb-4 sm:mb-6 md:mb-8 rounded-full transition-all duration-700 group-hover:w-16 sm:group-hover:w-20 md:group-hover:w-24"
                      style={{
                        background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                      }}
                    ></div>

                    <h3 
                      className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 tracking-tight"
                      style={{
                        background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base md:text-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 md:py-12 lg:py-24 relative overflow-hidden bg-gray-50">
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(135deg, rgba(255, 212, 71, 0.1) 0%, rgba(255, 111, 94, 0.1) 50%, rgba(255, 212, 71, 0.1) 100%)",
          }}
        >
          <div 
            className="absolute top-10 left-10 w-48 h-48 md:w-64 md:h-64 rounded-full blur-3xl opacity-20"
            style={{
              background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div 
            className="absolute bottom-10 right-10 w-56 h-56 md:w-80 md:h-80 rounded-full blur-3xl opacity-15"
            style={{
              background: "linear-gradient(135deg, #FF6F5E 0%, #FFD447 100%)",
              animation: "float 8s ease-in-out infinite 2s",
            }}
          />
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 md:mb-8">
              <div 
                className="h-0.5 md:h-1 w-16 md:w-24 mx-auto mb-3 md:mb-6 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
            </div>
            <h2 
              className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 md:mb-6 lg:mb-8 tracking-tight px-4"
              style={{
                background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Join Us Today
            </h2>
            <p className="text-sm md:text-lg lg:text-xl xl:text-2xl text-gray-600 mb-6 md:mb-10 lg:mb-14 max-w-2xl mx-auto leading-relaxed px-4">
              Become part of our growing community and start making meaningful connections today.
            </p>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center px-4">
              <Link
                to="/events"
                className="group inline-flex items-center justify-center px-6 md:px-8 lg:px-10 py-3.5 md:py-4 rounded-full font-semibold transition-all duration-500 relative overflow-hidden text-sm md:text-base w-full md:w-auto"
                style={{
                  background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                  color: "#1C2951",
                  boxShadow: "0 4px 20px rgba(255, 111, 94, 0.3)",
                  minHeight: '44px',
                }}
                onMouseEnter={(e) => {
                  if (window.innerWidth >= 768) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(255, 111, 94, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(255, 111, 94, 0.3)";
                }}
                onTouchStart={(e) => {
                  if (window.innerWidth < 768) {
                    e.currentTarget.style.opacity = "0.9";
                  }
                }}
                onTouchEnd={(e) => {
                  if (window.innerWidth < 768) {
                    setTimeout(() => {
                      e.currentTarget.style.opacity = "1";
                    }, 150);
                  }
                }}
              >
                <span className="relative z-10">Explore Events</span>
                <FaArrowRight 
                  className="ml-2 md:ml-3 relative z-10 transition-all duration-300 group-hover:translate-x-1" 
                  size={14}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
      `}</style>
    </div>
  );
};

export default Community;

