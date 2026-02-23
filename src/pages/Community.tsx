import { useEffect } from "react";
import { FaArrowRight, FaBullhorn, FaCheckCircle, FaComments, FaSearch, FaTelegramPlane, FaUserFriends, FaUsers } from "react-icons/fa";

const Community = () => {
  // Update page title and meta tags for SEO
  useEffect(() => {
    document.title = "Yenege Community | Connect, Share, Grow";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Join Yenege Community - Your All-in-One Hub for Events, Networking, and Personal Growth in Addis Ababa.');
    }
  }, []);

  const telegramLink = "https://t.me/c/3354026724/1";

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
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 tracking-tighter uppercase px-2 text-[#1a1a1a]">
              Yenege Community
            </h1>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8 md:mb-12 text-[#FF6F5E] tracking-tight">
              Connect, Share, Grow.
            </h2>

            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4 font-light mb-12">
              Your All-in-One Hub for Events, Networking, and Personal Growth
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-2xl mx-auto">
              <a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-5 px-10 rounded-full border-2 border-[#1C2951] text-[#1C2951] font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
              >
                Explore Events
              </a>
              <a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-5 px-10 rounded-full bg-[#1C2951] text-white font-bold text-lg hover:bg-[#FF6F5E] transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                Join the Community <FaTelegramPlane />
              </a>
            </div>
          </div>
        </div>

        {/* Backdrop Glow */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full blur-[120px] opacity-10" style={{ background: "radial-gradient(circle, #FFD447 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] rounded-full blur-[120px] opacity-10" style={{ background: "radial-gradient(circle, #FF6F5E 0%, transparent 70%)" }} />
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 leading-relaxed font-light">
              At Yenege, we are building <span className="text-[#1C2951] font-bold">more than just a platform</span> — we’re creating a vibrant, supportive community where people can connect, collaborate, and thrive. 
            </p>
            <div className="mt-10 h-1 w-16 mx-auto bg-[#FFD447]"></div>
            <p className="mt-10 text-lg md:text-xl text-gray-600 font-light italic">
              Whether you’re an event organizer looking for participants, a creative wanting to promote yourself, or someone seeking like-minded friends, Yenege is the place to be.
            </p>
          </div>
        </div>
      </section>

      {/* Why Yenege Slider/Grid */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-bold text-[#1a1a1a] tracking-tight mb-6">Why Yenege?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: <FaUsers />,
                title: "1. Connect with Amazing People",
                desc: "Meet individuals who share your passions, interests, and values. Build meaningful relationships that extend far beyond a single event.",
                color: "#FFD447"
              },
              {
                icon: <FaBullhorn />,
                title: "2. Promote Yourself and Your Work",
                desc: "Showcase your events, projects, or personal achievements. Our community encourages visibility and recognition.",
                color: "#FF6F5E"
              },
              {
                icon: <FaSearch />,
                title: "3. Discover and Attend Exciting Events",
                desc: "Never miss out on the experiences that matter. Explore a wide range of sessions, adventures, and cultural gatherings.",
                color: "#1C2951"
              },
              {
                icon: <FaComments />,
                title: "4. Share Stories and Inspire",
                desc: "Your voice matters. Share your experiences, insights, and stories to inspire others and contribute to a dynamic community.",
                color: "#FFD447"
              },
              {
                icon: <FaUserFriends />,
                title: "5. Build Lasting Friendships",
                desc: "Forge genuine connections in a safe, welcoming environment. At Yenege, friendships aren’t just made—they’re nurtured.",
                color: "#FF6F5E"
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 transition-all duration-300 hover:bg-white hover:shadow-2xl hover:-translate-y-2 group">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 transition-transform group-hover:rotate-12" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-6 text-[#1a1a1a] leading-tight">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Join */}
      <section className="py-20 md:py-32 bg-[#1C2951] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl md:text-5xl font-bold mb-12 tracking-tight">How to Join</h2>
              <p className="text-xl text-gray-300 mb-12 font-light">Becoming part of Yenege is simple:</p>
              
              <div className="space-y-8">
                {[
                  "Sign up and create your profile.",
                  "Connect with people who share your interests.",
                  "Explore events and promote your own.",
                  "Engage in discussions, share your stories, and grow."
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-6 group">
                    <div className="mt-1">
                      <FaCheckCircle className="text-[#FFD447] text-2xl" />
                    </div>
                    <p className="text-xl md:text-2xl font-light text-gray-300 group-hover:text-white transition-colors">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full bg-white/5 backdrop-blur-xl p-10 md:p-14 rounded-[3rem] border border-white/10 text-center">
               <h3 className="text-2xl md:text-3xl font-bold mb-8 text-[#FFD447]">Start Making Meaningful Connections!</h3>
               <p className="text-lg text-gray-300 mb-10 font-light">Join today and begin your journey with Yenege Community.</p>
               <a
                 href={telegramLink}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-3 px-10 py-5 bg-[#FF6F5E] text-white font-bold rounded-full text-xl hover:scale-105 transition-transform shadow-lg"
               >
                 Join Locally <FaArrowRight />
               </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final Action */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
             <h2 className="text-3xl md:text-5xl font-bold mb-12 text-[#1a1a1a]">Join Today and Start Making Meaningful Connections!</h2>
             <div className="flex flex-col sm:flex-row justify-center gap-6">
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-5 rounded-full border-2 border-[#1C2951] text-[#1C2951] font-bold text-lg hover:bg-gray-50 transition-all font-bold"
                >
                  Explore Events
                </a>
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-5 rounded-full bg-[#1C2951] text-white font-bold text-lg hover:bg-[#FF6F5E] transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  Join the Community <FaTelegramPlane />
                </a>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Community;
