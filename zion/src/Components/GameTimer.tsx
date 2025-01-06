import React, { useContext } from 'react';
import { TimeContext } from '../App';
import { motion } from 'framer-motion';

const GameTimer = () => {
  const { remainingTime, isExpired } = useContext(TimeContext);
  const progressPercentage = (remainingTime / 120) * 100; // Assuming 120 is the total time

  // Log the remaining time to the console
  console.log(remainingTime);

  // Convert remainingTime to minutes and seconds
  const minutes = Math.floor(Math.abs(remainingTime) / 60);
  const seconds = Math.abs(remainingTime) % 60;

  return (
    <div className="text-center">
      <div className="text-lg font-bold mb-2">
        {isExpired ? "Time Expired!" : `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1 }}
          className={`h-2.5 rounded-full ${
            isExpired ? 'bg-red-500' : 
            progressPercentage > 50 ? 'bg-green-500' : 
            progressPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
        />
      </div>
    </div>
  );
};

export default GameTimer;
