import React from 'react';
import logo from '/zionlogo.png';
import { motion } from 'framer-motion';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-black-primary">
    {/* Animated logo with gold accent */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative mb-8"
    >
      <img 
        src={logo} 
        alt="Loading..." 
        className="h-32 w-32 object-contain"
      />
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold-primary border-r-gold-primary"
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </motion.div>

    {/* Loading text with animated dots */}
    <div className="text-center">
      <motion.h2 
        className="text-xl font-medium text-gold-light mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Loading GameHub
      </motion.h2>
      <motion.div
        className="flex justify-center space-x-1 text-gold-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          >
            .
          </motion.span>
        ))}
      </motion.div>
    </div>

    {/* Decorative elements */}
    <motion.div 
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      <p>Premium Gaming Experience</p>
    </motion.div>
  </div>
);

export default LoadingSpinner;