import { FaHandshake, FaHeart, FaRocket, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Story</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Building a community where happiness, connection, and unforgettable experiences come together
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Story Section */}
        <section className="max-w-4xl mx-auto mb-20">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">The Yenege Dream</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Yenege was born from a simple yet powerful vision: to bring happiness to life through meaningful connections and unforgettable experiences.
              </p>
              <p>
                We believe that life's greatest moments happen when people come together—whether it's over a board game, on a weekend adventure, or simply sharing stories in a welcoming community space.
              </p>
              <p>
                What started as a dream to create a space where people could escape the daily grind and truly connect has grown into a vibrant community of individuals who value joy, friendship, and living life to the fullest.
              </p>
              <p>
                Every event we organize, every trip we plan, and every gathering we host is designed with one goal in mind: to bring a little more happiness into your life.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeart className="text-amber-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Happiness First</h3>
              <p className="text-gray-600">
                Everything we do is centered around bringing joy and positivity into people's lives.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-600">
                We believe in the power of connection and building lasting friendships.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRocket className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Adventure</h3>
              <p className="text-gray-600">
                Life is meant to be explored. We encourage stepping out of comfort zones.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHandshake className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Inclusivity</h3>
              <p className="text-gray-600">
                Everyone is welcome. We celebrate diversity and create safe spaces for all.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="max-w-4xl mx-auto mb-20">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-700">
                To create a vibrant community platform that brings people together through engaging events, 
                exciting adventures, and meaningful connections, making happiness accessible to everyone.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-700">
                To become the leading lifestyle and events platform in Ethiopia, known for creating 
                unforgettable experiences and building a community where every member feels valued and happy.
              </p>
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Our Journey</h2>
          <div className="space-y-8">
            {[
              { year: "2024", title: "Launch", description: "Yenege officially launched with our first community events" },
              { year: "2024", title: "Growth", description: "Expanded to include travel adventures and corporate events" },
              { year: "Future", title: "Expansion", description: "Building towards becoming Ethiopia's premier lifestyle platform" },
            ].map((milestone, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {milestone.year.slice(-2)}
                  </div>
                </div>
                <div className="flex-grow bg-white rounded-xl p-6 shadow-md">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto text-center bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Us on This Journey</h2>
          <p className="text-xl mb-8 opacity-90">
            Be part of a community that's making life more joyful, one event at a time.
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
        </section>
      </div>
    </div>
  );
};

export default About;

