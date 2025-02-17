import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import ThankYou from './ThankYou';
import { TimeContext } from '../App';

interface TimeContextType {
  remainingTime: number;
  isExpired: boolean;
  formatTime: (seconds: number) => string;
}

const GameTimer = () => {
  const context = useContext(TimeContext) as TimeContextType;
  const { remainingTime, isExpired, formatTime } = context;
  const progressPercentage = (remainingTime / 120) * 100;

  const getProgressColor = (percentage: number) => {
    if (percentage > 50) return '#22c55e';
    if (percentage > 20) return '#eab308';
    return '#ef4444';
  };

  if (isExpired) {
    return (
      <div className="fixed inset-0 z-50">
        <ThankYou />
      </div>
    );
  }

  return (
    <div className="text-center  space-y-2">
      <motion.div
        className="text-2xl font-bold"
        animate={{
          color: getProgressColor(progressPercentage),
          scale: remainingTime < 20 ? [1, 1.05, 1] : 1
        }}
        transition={{
          color: { duration: 0.3 },
          scale: { duration: 0.8, repeat: Infinity }
        }}
      >
        {formatTime(remainingTime)}
      </motion.div>
      
      <div className="w-full bg-yellow-200 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{
            width: `${progressPercentage}%`,
            backgroundColor: getProgressColor(progressPercentage)
          }}
          transition={{
            duration: 0.5,
            ease: 'linear'
          }}
          className="h-full relative"
        >
          <motion.div
            className="absolute inset-0 bg-white opacity-20"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default GameTimer;