import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaHome, FaArrowLeft } from 'react-icons/fa';

const AccessDenied: React.FC = () => {
  return (
    <div className="min-h-screen bg-black-primary flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/20 text-red-400">
            <FaLock className="text-4xl" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-gray-light text-lg mb-8">
          Sorry, you don't have permission to access this page. 
          Please contact an administrator if you believe this is an error.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gold-primary text-black-primary font-medium rounded-lg hover:bg-gold-secondary transition-colors duration-200"
          >
            <FaHome className="mr-2" />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-dark text-white font-medium rounded-lg hover:bg-gray-medium transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-gray-dark rounded-lg">
          <p className="text-sm text-gray-light">
            If you need access to this feature, please contact your administrator 
            or reach out to our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
