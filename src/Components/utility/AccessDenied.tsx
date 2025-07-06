import React from 'react';
import { Link } from 'react-router-dom';

const AccessDenied: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black-primary to-black-secondary">
      <div className="bg-black-secondary p-8 rounded-lg shadow-md text-center border border-gold-primary/20">
        <h1 className="text-4xl font-bold text-gold-primary mb-4">Access Denied</h1>
        <p className="text-lg text-cream mb-6">
          You do not have permission to view this page.
        </p>
        <Link
          to="/"
          className="inline-block bg-gold-primary hover:bg-gold-secondary text-black-primary font-bold py-2 px-4 rounded-full transition duration-300"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied;
