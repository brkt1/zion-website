import React from 'react';
import logo from '/zionlogo.png';
import { motion } from 'framer-motion';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-black w-full overflow-hidden">
    {/* Modern logo container with subtle glow - now with full-width black background */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "backOut" }}
      className="relative mb-8 p-6 rounded-2xl bg-gray-900 bg-opacity-60 backdrop-blur-sm border border-gray-800"
    >
      <img 
        src={logo} 
        alt="Loading..." 
        className="h-28 w-28 object-contain drop-shadow-gold"
      />
      {/* Dual ring animation for modern effect */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold-400 border-r-gold-400"
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1.8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-transparent border-b-gold-600 border-l-gold-600"
        animate={{ rotate: -360 }}
        transition={{ 
          duration: 2.2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </motion.div>

    {/* Modern loading text with animated progress */}
    <div className="text-center space-y-4 px-4 w-full max-w-md mx-auto">
      <motion.h2 
        className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Loading GameHub
      </motion.h2>
      
      {/* Modern progress indicator - now full-width constrained */}
      <motion.div 
        className="h-1.5 w-full mx-auto bg-gray-800 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600"
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

    {/* Modern decorative footer - now properly constrained */}
    <motion.div 
      className="fixed bottom-8 left-0 right-0 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      <p className="text-sm text-gray-400 font-light tracking-wider">
        PREMIUM <span className="text-gold-400 mx-2">●</span> GAMING <span className="text-gold-400 mx-2">●</span> EXPERIENCE
      </p>
    </motion.div>

    {/* Subtle particle background - now full coverage */}
    <div className="fixed inset-0 pointer-events-none z-0">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gold-400 bg-opacity-10"
          initial={{
            x: Math.random() * 100 + 'vw',
            y: Math.random() * 100 + 'vh',
            width: Math.random() * 12 + 3 + 'px',
            height: Math.random() * 12 + 3 + 'px',
            opacity: 0
          }}
          animate={{
            opacity: [0, 0.2, 0],
            y: [0, -Math.random() * 100 - 50],
            x: [0, (Math.random() - 0.5) * 50]
          }}
          transition={{
            duration: Math.random() * 8 + 8,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
        />
      ))}
    </div>

    {/* Edge fade effect to ensure no white space shows */}
    <div className="fixed inset-0 pointer-events-none z-10 shadow-[inset_0_0_50px_20px_rgba(0,0,0,1)]" />
  </div>
);

export default LoadingSpinner;