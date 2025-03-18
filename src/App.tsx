import React, { createContext, useState, useEffect, useRef } from "react";
import ErrorBoundary from "./Components/ErrorBoundary";
import { TimeContextType } from "./@types/TimeContextType";

import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"; 
import { motion } from 'framer-motion';
import Lovers from "./TruthandDear-Component/Lovers";
import ThankYou from "./Components/ThankYou";
import RockPaperScissors from "./Components/RockPaperScissors";
import Friends from "./TruthandDear-Component/Friends";
import LoveGameMode from "./TruthandDear-Component/LoveGameMode";
import FriendsGameMode from "./TruthandDear-Component/FriendsGameMode";
import GameScreen from "./Components/GameScreen";
import TruthOrDare from "./TruthandDear-Component/TruthOrDare";
import EmojiGame from "./Emoji-Component/EmojiGame";
import QRScanMode from "./payment/QRScanMode"; 
import Landing from "./MainLanding";
import TriviaGame from "./Triva-Component/Trivia";
import CafeOwnerCheckWinner from "./Components/CafeOwnerCheckWinner";
import Admin from "./Components/admin/AdminPanel";
import Login from "./Components/auth/Login";

/**
 * @typedef {import('./@types/app').TimeContextType} TimeContextType
 */

// Create context with JSDoc type
/** @type {React.Context<TimeContextType>} */
export const TimeContext = createContext<TimeContextType | null>(null);



const formatTime = (seconds: number): string => { 



  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Modern Time Display Component
const TimeDisplay = ({ remainingTime }: { remainingTime: number }): JSX.Element => { 



  const navigate = useNavigate(); 

  const getProgressPercentage = () => {
    return ((300 - remainingTime) / 300) * 100;
  };

  useEffect(() => {
    if (remainingTime <= 30) {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
    if (remainingTime <= 0) {
      navigate('/thank-you');
    }
  }, [remainingTime, navigate]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div>
        <div className="w-full h-1 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500/70 to-purple-600/70 transition-all duration-500 ease-in-out"
            style={{
              width: `${getProgressPercentage()}%`,
              transformOrigin: 'left'
            }}
          />
        </div>
        <div className="flex items-center justify-center py-3 px-6">
          <div className="flex items-center space-x-3">
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6"
              initial={{ rotate: 0 }}
              animate={{ 
                rotate: remainingTime <= 30 ? [0, 15, -15, 0] : 0,
              }}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </motion.svg>

            <motion.span 
              className="text-2xl font-bold tracking-wider"
              initial={{ opacity: 1, scale: 1 }}
              animate={
                remainingTime <= 30 
                  ? { 
                      scale: [1, 1.1, 1],
                      transition: { 
                        duration: 0.5,
                        repeat: Infinity 
                      }
                    }
                  : {}
              }
            >
              {formatTime(remainingTime)}
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactElement }): JSX.Element => { 
  const location = useLocation();
  const state = location.state;

  if (!state?.cardDetails || state.remainingTime <= 0) {
    return <Navigate to="/qr-scan" replace />;
  }

  return React.cloneElement(children, {
    cardDetails: state.cardDetails,
    remainingTime: state.remainingTime,
  });
};

// Main App Component
const TIMER_STORAGE_KEY = 'gameTimerState';

const App = () => {
  // Initialize state from localStorage
  const initializeTimerState = () => {
    try {
      const savedState = localStorage.getItem(TIMER_STORAGE_KEY);
      if (savedState) {
        const { remainingTime: savedTime, timestamp, isActive } = JSON.parse(savedState);
        if (savedTime > 0) {
          const elapsedSeconds = Math.floor((Date.now() - timestamp) / 1000);
          const newRemainingTime = Math.max(0, savedTime - (isActive ? elapsedSeconds : 0));
          return {
            remainingTime: newRemainingTime,
            isTimerActive: isActive && newRemainingTime > 0,
            isExpired: newRemainingTime <= 0
          };
        }
      }
    } catch (error) {
      console.error("Error initializing timer state from localStorage:", error);
    }
    return { remainingTime: 0, isTimerActive: false, isExpired: false };
  };

  const { remainingTime: initialTime, isTimerActive: initialIsActive, isExpired: initialIsExpired } = initializeTimerState();
  
  const [remainingTime, setRemainingTime] = useState(initialTime);
  const [isTimerActive, setIsTimerActive] = useState(initialIsActive);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isExpired, setIsExpired] = useState(initialIsExpired);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    try {
      if (remainingTime > 0) {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
          remainingTime,
          isActive: isTimerActive,
          timestamp: Date.now()
        }));
      } else {
        localStorage.removeItem(TIMER_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error saving timer state to localStorage:", error);
    }
  }, [remainingTime, isTimerActive]);

  // Handle timer countdown
  useEffect(() => {
    if (isTimerActive) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 0) {
            setIsExpired(true);
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            localStorage.removeItem(TIMER_STORAGE_KEY);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerActive]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Save current state when page is hidden
        try {
          if (remainingTime > 0) {
            localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
              remainingTime,
              isActive: isTimerActive,
              timestamp: Date.now()
            }));
          }
        } catch (error) {
          console.error("Error saving timer state on visibility change:", error);
        }
      } else {
        // Recalculate time when page becomes visible
        try {
          const savedState = localStorage.getItem(TIMER_STORAGE_KEY);
          if (savedState) {
            const { remainingTime: savedTime, timestamp, isActive } = JSON.parse(savedState);
            const elapsedSeconds = Math.floor((Date.now() - timestamp) / 1000);
            const newRemainingTime = Math.max(0, savedTime - (isActive ? elapsedSeconds : 0));
            
            setRemainingTime(newRemainingTime);
            setIsTimerActive(isActive && newRemainingTime > 0);
            setIsExpired(newRemainingTime <= 0);
          }
        } catch (error) {
          console.error("Error recalculating timer state on visibility change:", error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [remainingTime, isTimerActive]);

  // Remove automatic navigation on expiry to let user choose

const startTimer = (initialTime: number): void => { 
  // Start the timer with the given initial time

  // Start the timer with the given initial time


    setRemainingTime(initialTime);
    setIsTimerActive(true);
    setIsExpired(false);
  };

  const pauseTimer = () => {
    setIsTimerActive(false);
  };

const resetTimer = (initialTime: number): void => { 
  // Reset the timer to the initial time

  // Reset the timer to the initial time


    setRemainingTime(initialTime);
    setIsTimerActive(false);
    setIsExpired(false);
  };

  return (
    <ErrorBoundary>
      <TimeContext.Provider 
      value={{ 
        remainingTime, 
        setRemainingTime, 
        startTimer, 
        pauseTimer, 
        resetTimer,
        formatTime,
        isExpired 
      }}
    >
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {isTimerActive && (
          <TimeDisplay remainingTime={remainingTime} />
        )}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Landing />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/lovers" element={<Lovers />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/game-mode" element={<LoveGameMode />} />
          <Route path="/friends-game-mode" element={<FriendsGameMode />} />
          <Route path="/game-screen" element={<GameScreen />} />
          <Route path="/qr-scan" element={<QRScanMode />} />
          <Route path="/admin" element={<Admin />} />
          <Route 
            path="/trivia-game" 
            element={
              <ProtectedRoute>
                <TriviaGame />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/truth-or-dare" 
            element={
              <ProtectedRoute>
                <TruthOrDare />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/rock-paper-scissors" 
            element={
              <ProtectedRoute>
                <RockPaperScissors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/emoji-game" 
            element={
              <ProtectedRoute>
                <EmojiGame />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cafe-owner/check-winner" 
            element={<CafeOwnerCheckWinner />} 
          />
        </Routes>
      </BrowserRouter>
    </TimeContext.Provider>
    </ErrorBoundary>
  );
};

export default App;
