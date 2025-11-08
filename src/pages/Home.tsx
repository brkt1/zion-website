import { FaArrowRight, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-20 md:py-32">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center mb-6 px-4 py-2 rounded-full bg-amber-100 border border-amber-200">
              <span className="text-amber-800 font-medium text-sm">🌍 YENEGE</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Bringing Happiness
              <span className="block text-amber-600 mt-2">to Life</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Discover events, join adventures, and connect with a community that celebrates life's beautiful moments.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/events"
                className="inline-flex items-center justify-center px-8 py-4 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Explore Events
                <FaArrowRight className="ml-2" />
              </Link>
              <Link
                to="/community"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-amber-600 border-2 border-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-all"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Event Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From game nights to travel adventures, we create experiences that bring people together
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Game Nights */}
            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-purple-100">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🎮</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Game Nights</h3>
              <p className="text-gray-600 mb-6">
                Fun-filled evenings with board games, trivia, and interactive challenges. Perfect for making new friends!
              </p>
              <Link
                to="/events?category=game"
                className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700"
              >
                Explore Game Nights
                <FaArrowRight className="ml-2" />
              </Link>
            </div>

            {/* Travel & Adventures */}
            <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-blue-100">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">✈️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Travel & Adventures</h3>
              <p className="text-gray-600 mb-6">
                Weekend getaways, day trips, and exciting adventures. Explore new places with amazing people.
              </p>
              <Link
                to="/travel"
                className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
              >
                Discover Adventures
                <FaArrowRight className="ml-2" />
              </Link>
            </div>

            {/* Community */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-green-100">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">💚</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-600 mb-6">
                Join a vibrant community of happy people. Share stories, connect, and build lasting friendships.
              </p>
              <Link
                to="/community"
                className="inline-flex items-center text-green-600 font-semibold hover:text-green-700"
              >
                Join Us
                <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Carousel */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
            <p className="text-xl text-gray-600">Don't miss out on these exciting experiences</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Sample Event Cards */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="h-48 bg-gradient-to-br from-amber-400 to-orange-500 relative">
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-amber-600">
                    Coming Soon
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <FaCalendarAlt className="mr-2" />
                    <span>Date TBA</span>
                    <FaMapMarkerAlt className="ml-4 mr-2" />
                    <span>Addis Ababa</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Amazing Event {item}</h3>
                  <p className="text-gray-600 mb-4">
                    Join us for an unforgettable experience filled with fun, laughter, and great memories.
                  </p>
                  <Link
                    to="/events"
                    className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700"
                  >
                    Learn More
                    <FaArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/events"
              className="inline-flex items-center px-8 py-4 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl"
            >
              View All Events
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Join the Fun?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Be part of a community that celebrates life, creates memories, and brings happiness to every moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/events"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-amber-600 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              Explore Events
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-amber-600 transition-all"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

