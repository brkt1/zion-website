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

  // Show ThankYou component immediately when timer expires
  if (isExpired) {
    return (
      <div className="fixed inset-0 z-50">
        <ThankYou />
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-lg font-bold mb-2">
        {formatTime(remainingTime)}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1 }}
          className={`h-2.5 rounded-full ${
            progressPercentage > 50 ? 'bg-green-500' : 
            progressPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
        />
      </div>
    </div>
  );
};

export default GameTimer;
