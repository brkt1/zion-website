import { useState } from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  category: "game" | "travel" | "corporate" | "community";
  image: string;
  description: string;
  attendees?: number;
}

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sample events data - replace with real data from API
  const events: Event[] = [
    {
      id: "1",
      title: "Friday Game Night",
      date: "2024-02-15",
      location: "Addis Ababa",
      category: "game",
      image: "/api/placeholder/400/300",
      description: "Join us for an evening of board games, trivia, and fun!",
      attendees: 25,
    },
    {
      id: "2",
      title: "Weekend Getaway to Debre Zeit",
      date: "2024-02-20",
      location: "Debre Zeit",
      category: "travel",
      image: "/api/placeholder/400/300",
      description: "Explore the beautiful lakes and enjoy a relaxing weekend.",
      attendees: 15,
    },
    {
      id: "3",
      title: "Community Meetup",
      date: "2024-02-25",
      location: "Addis Ababa",
      category: "community",
      image: "/api/placeholder/400/300",
      description: "Connect with fellow community members and share stories.",
      attendees: 40,
    },
  ];

  const categories = [
    { id: "all", name: "All Events", icon: "🎉" },
    { id: "game", name: "Game Nights", icon: "🎮" },
    { id: "travel", name: "Travel", icon: "✈️" },
    { id: "corporate", name: "Corporate", icon: "💼" },
    { id: "community", name: "Community", icon: "💚" },
  ];

  const filteredEvents = events.filter((event) => {
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-xl opacity-90">Discover amazing experiences and join the fun!</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedCategory === category.id
                    ? "bg-amber-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 mb-4">No events found</p>
            <p className="text-gray-500">Try adjusting your filters or check back later!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className="h-48 bg-gradient-to-br from-amber-400 to-orange-500 relative">
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-amber-600">
                    {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{event.title}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2 text-amber-600" />
                      <span className="text-sm">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-amber-600" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    {event.attendees && (
                      <div className="flex items-center text-gray-600">
                        <FaUsers className="mr-2 text-amber-600" />
                        <span className="text-sm">{event.attendees} attending</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex items-center text-amber-600 font-semibold">
                    View Details
                    <span className="ml-2">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Want to host an event?</h2>
          <p className="text-gray-600 mb-6">Get in touch with us to organize your own community event!</p>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Events;

