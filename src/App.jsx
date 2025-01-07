import React, { createContext, useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"; 
import { motion } from 'framer-motion';
import Lovers from "./TruthandDear-Component/Lovers";
import RockPaperScissors from "./Components/RockPaperScissors";
import Friends from "./TruthandDear-Component/Friends";
import LoveGameMode from "./TruthandDear-Component/LoveGameMode";
import FriendsGameMode from "./TruthandDear-Component/FriendsGameMode";
import GameScreen from "./components/GameScreen";
import TruthOrDare from "./TruthandDear-Component/TruthOrDare";
import EmojiGame from "./Emoji-Component/EmojiGame";
import QRScanMode from "./payment/QRScanMode"; 
import Landing from "./MainLanding";
export const TimeContext = createContext();
import CardGenerator from "./payment/CardGenerator";
import TriviaGame from "./Triva-Component/Trivia";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Modern Time Display Component
const TimeDisplay = ({ remainingTime }) => {
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
      navigate('/'); // Change '/' to your actual landing page route
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
const ProtectedRoute = ({ children }) => {
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
const App = () => {
  const [remainingTime, setRemainingTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (isTimerActive) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 0) {
            setIsExpired(true);
            clearInterval(timerRef.current);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerActive]);

  useEffect(() => {
    if (isExpired) {
      window.location.href = '/';
    }
  }, [isExpired]);

  const startTimer = (initialTime) => {
    setRemainingTime(initialTime);
    setIsTimerActive(true);
    setIsExpired(false);
  };

  const pauseTimer = () => {
    setIsTimerActive(false);
  };

  const resetTimer = (initialTime) => {
    setRemainingTime(initialTime);
    setIsTimerActive(false);
    setIsExpired(false);
  };

  return (
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
      <Router>
        {isTimerActive && (
          <TimeDisplay remainingTime={remainingTime} />
        )}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/lovers" element={<Lovers />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/game-mode" element={<LoveGameMode />} />
          <Route path="/friends-game-mode" element={<FriendsGameMode />} />
          <Route path="/game-screen" element={<GameScreen />} />
          <Route path='/card-generator' element={<CardGenerator />} />
          <Route path="/qr-scan" element={<QRScanMode />} />
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
        </Routes>
      </Router>
    </TimeContext.Provider>
  );
};

export default App;
