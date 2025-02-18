import React, { useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThankYou from './ThankYou';
import { TimeContext } from '../App.jsx';


// Register service worker and set up message handling
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};


interface TimeContextType {
  remainingTime: number;
  isExpired: boolean;
  formatTime: (seconds: number) => string;
  updateTimer: (remainingTime: number, isExpired: boolean) => void;
}


const GameTimer = () => {
  const context = useContext(TimeContext) as TimeContextType;
  const { remainingTime, isExpired, formatTime } = context;
  const progressPercentage = (remainingTime / 120) * 100;

  useEffect(() => {
    // Register service worker on component mount
    registerServiceWorker();

    // Set up message listener for timer updates
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'TIMER_UPDATE') {
          // Handle timer updates from service worker
          const { remainingTime, isExpired } = event.data;
          context.updateTimer(remainingTime, isExpired);
        }
      });
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', () => {});
      }

    };
  }, [context]);


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
