import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClock, FiHome, FiRepeat } from 'react-icons/fi';

const ThankYou: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleTryAgain = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Particle animation variants
  const particleVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: (i: number) => ({
      opacity: [0.4, 0],
      scale: [1, 2],
      x: [0, (Math.random() - 0.5) * 100],
      y: [0, (Math.random() - 0.5) * 100],
      transition: {
        delay: i * 0.02,
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop'
      }
    })
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/50 to-purple-900 z-50 overflow-hidden"
    >
      {/* Animated background particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          variants={particleVariants}
          initial="initial"
          animate="animate"
          custom={i}
          className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
        />
      ))}

      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
        className="relative bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8 max-w-lg w-full mx-4 text-center space-y-6"
      >
        <div className="relative inline-block">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="absolute -top-8 -right-8 p-4 bg-purple-500/20 rounded-full backdrop-blur-sm"
          >
            <FiClock className="w-12 h-12 text-purple-400" />
          </motion.div>
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"
          >
            Time's Up!
          </motion.h1>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-300 text-lg leading-relaxed max-w-md mx-auto"
        >
          Great effort! Ready for another round or want to head back?
        </motion.p>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTryAgain}
            className="flex items-center justify-center gap-2 bg-gradient-to-br from-purple-500 to-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold 
                      hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
          >
            <FiRepeat className="w-5 h-5" />
            Try Again
          </motion.button>
          
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700/70 text-white px-8 py-4 rounded-xl text-lg font-semibold 
                      hover:shadow-lg hover:shadow-slate-500/20 transition-all duration-300"
          >
            <FiHome className="w-5 h-5" />
            Go Home
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ThankYou;