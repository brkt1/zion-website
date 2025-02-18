// LoadingSpinner.js
import React from 'react';
import logo from '/zionlogo.png'; // Update the path to your logo image

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
    <img src={logo} alt="Loading..." className="h-32 w-32 animate-pulse" />
  </div>
);

export default LoadingSpinner;