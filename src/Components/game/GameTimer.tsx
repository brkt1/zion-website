import React, { useContext, useEffect, useCallback, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
const ThankYou = React.lazy(() => import('../utility/ThankYou'));
import { TimeContext } from '../../App.tsx';
import type { TimeContextType } from '../../@types/app';

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
  const { remainingTime, isExpired, formatTime, updateTimer, isTimerActive } = context;
  const progressPercentage = (remainingTime / 120) * 100;
  const navigate = useNavigate();

  // Save timer state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('timerState', JSON.stringify({
      remainingTime,
      isExpired,
      isTimerActive,
      lastUpdated: Date.now()
    }));
  }, [remainingTime, isExpired, isTimerActive]);

  // Load timer state from sessionStorage on component mount
  useEffect(() => {
    const savedState = sessionStorage.getItem('timerState');
    if (savedState) {
      try {
        const { remainingTime, isExpired, isTimerActive, lastUpdated } = JSON.parse(savedState);
        
        // Calculate elapsed time since last save
        const elapsedSeconds = Math.floor((Date.now() - lastUpdated) / 1000);
        const updatedRemainingTime = Math.max(0, remainingTime - elapsedSeconds);
        const updatedIsExpired = updatedRemainingTime <= 0;
        
        updateTimer(updatedRemainingTime, updatedIsExpired);
        
        // If timer was active and now expired, show thank you
        if (isTimerActive && updatedIsExpired) {
          navigate('/thank-you'); // or show the ThankYou component directly
        }
      } catch (error) {
        console.error('Failed to parse saved timer state:', error);
      }
    }
  }, [updateTimer, navigate]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && remainingTime > 0 && isTimerActive) {
      navigate('/');
    }
  }, [remainingTime, isTimerActive, navigate]);

  useEffect(() => {
    registerServiceWorker();

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'TIMER_UPDATE') {
          const { remainingTime, isExpired } = event.data;
          updateTimer(remainingTime, isExpired);
        }
      });
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleVisibilityChange);

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', () => {});
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleVisibilityChange);
    };
  }, [updateTimer, handleVisibilityChange]);

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