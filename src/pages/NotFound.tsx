import { useEffect } from 'react';
import { FaArrowLeft, FaExclamationTriangle, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const NotFound = () => {
  useEffect(() => {
    // Update page title and meta tags for SEO
    document.title = '404 - Page Not Found | Yenege';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'The page you are looking for could not be found.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            404
          </h1>
        </div>

        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-amber-100 rounded-full">
            <FaExclamationTriangle className="text-6xl text-amber-500" />
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <FaHome className="text-lg" />
            Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FaArrowLeft className="text-lg" />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">You might be looking for:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/events"
              className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              Events
            </Link>
            <Link
              to="/travel"
              className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              Travel
            </Link>
            <Link
              to="/community"
              className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              Community
            </Link>
            <Link
              to="/about"
              className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

