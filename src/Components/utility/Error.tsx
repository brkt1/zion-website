// Error.js
import React from 'react';

const Error = ({ message }) => (
  <div className="bg-black-secondary border border-red-500 text-red-300 px-4 py-3 rounded relative" role="alert">
    <strong className="font-bold text-gold-light">Error!</strong>
    <span className="block sm:inline">{message}</span>
  </div>
);

export default Error;