import React, { useContext, useEffect, useCallback, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
const ThankYou = React.lazy(() => import('../utility/ThankYou'));
import { TimeContext } from '../../App.tsx';
import type { TimeContextType } from '../../@types/app';
import { TimeService } from '../../services/timeService';

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', { 
        scope: './', 
        type: 'module' 
      });
      
      
      if (registration.installing) {
        
      } else if (registration.waiting) {
        
      } else if (registration.active) {
        
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

const GameTimer = () => {
  const context = useContext(TimeContext) as TimeContextType;
  const { formatTime } = context;
  const [remainingTime, setRemainingTime] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const progressPercentage = (remainingTime / 120) * 100;
  const navigate = useNavigate();

  // Subscribe to TimeService updates
  useEffect(() => {
    const unsubscribe = TimeService.subscribe((state) => {
      setRemainingTime(state.remainingTime);
      setIsExpired(state.isExpired);
      setIsTimerActive(state.isActive);
    });
    return () => unsubscribe();
  }, []);

  // Load timer state from sessionStorage on component mount
  useEffect(() => {
    // TimeService state is managed by sessionStore, so GameTimer just observes it.
    // The initial state will be set by the sessionStore's subscription to TimeService.
    // No direct loading needed here.

    // If timer was active and now expired, show thank you
    if (isTimerActive && isExpired) {
      navigate('/thank-you'); // or show the ThankYou component directly
    }
  }, [navigate, isTimerActive, isExpired]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && remainingTime > 0 && isTimerActive) {
      navigate('/');
    }
  }, [remainingTime, isTimerActive, navigate]);

  useEffect(() => {
    registerServiceWorker();

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'TIMER_UPDATE') {
          // TimeService is already globally managing state, so no direct update needed here
          // The subscription in the other useEffect will handle state updates
        }
      };
      navigator.serviceWorker.addEventListener('message', messageHandler);
      return () => {
        navigator.serviceWorker.removeEventListener('message', messageHandler);
      };
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  if (isExpired) {
    return (
      <div className="fixed inset-0 z-50">
        <Suspense fallback={<div>Loading...</div>}>
          <ThankYou />
        </Suspense>
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