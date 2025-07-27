import React from 'react';
import logo from '/zionlogo.png';
import { motion } from 'framer-motion';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-black-primary  w-full overflow-hidden">
    {/* Logo container with dark mode styling */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "backOut" }}
      className="relative mb-8 p-6 rounded-2xl bg-black-primary  bg-opacity-70 backdrop-blur-sm border border-gray-700 shadow-lg"
    >
      <img 
        src={logo} 
        alt="Loading..." 
        className="h-28 w-28 object-contain filter brightness-90"
      />
    </motion.div>
  
    {/* Loading text with dark mode contrast */}
    <div className="text-center space-y-4">
      <motion.h2 
        className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Loading GameHub
      </motion.h2>
      
      {/* Progress indicator with dark mode colors */}
      <motion.div 
        className="h-1.5 w-48 mx-auto bg-gray-700 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>

    {/* Footer with dark mode text */}
    <motion.div 
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      <p className="text-sm flex text-gray-400 font-light tracking-wider">
        PREMIUM <span className="text-amber-500 mx-2">●</span> GAMING <span className="text-amber-500 mx-2">●</span> EXPERIENCE
      </p>
    </motion.div>

    {/* Subtle particle background - dark mode version */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-amber-500 bg-opacity-10"
          initial={{
            x: Math.random() * 100 + 'vw',
            y: Math.random() * 100 + 'vh',
            width: Math.random() * 8 + 2 + 'px',
            height: Math.random() * 8 + 2 + 'px',
            opacity: 0
          }}
          animate={{
            opacity: [0, 0.15, 0],
            y: [0, -40],
          }}
          transition={{
            duration: Math.random() * 6 + 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
        />
      ))}
    </div>
  </div>
);

export default LoadingSpinner;