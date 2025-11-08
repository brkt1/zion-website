import { FaEnvelope, FaInstagram, FaPhone, FaTelegram, FaTiktok, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🌍</span>
              <span className="text-xl font-bold text-white">YENEGE</span>
            </div>
            <p className="text-sm mb-4">
              Bringing happiness to life through events, adventures, and community connections.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/yenege"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://t.me/yenege"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Telegram"
              >
                <FaTelegram size={20} />
              </a>
              <a
                href="https://tiktok.com/@yenege"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <FaTiktok size={20} />
              </a>
              <a
                href="https://youtube.com/@yenege"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-amber-400 transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <FaEnvelope className="mr-2 text-amber-400" />
                <a
                  href="mailto:bereketyosef49@gmail.com"
                  className="hover:text-amber-400 transition-colors"
                >
                  bereketyosef49@gmail.com
                </a>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-2 text-amber-400" />
                <a
                  href="tel:+251978639887"
                  className="hover:text-amber-400 transition-colors"
                >
                  +251 978 639 887
                </a>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-amber-400">📍</span>
                <span>Addis Ababa, Ethiopia</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm mb-4">
              Subscribe to get notified about upcoming events and adventures.
            </p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© {currentYear} YENEGE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

