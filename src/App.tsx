import React, { createContext, useEffect, useMemo, lazy, Suspense } from "react";
import * as Sentry from "@sentry/react";
import './App.css';
import ErrorBoundary from "./Components/ErrorBoundary";
import { unstable_HistoryRouter as HistoryRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { createBrowserHistory } from 'history';

import { motion } from 'framer-motion';
import { useSessionStore } from './stores/sessionStore';
import { useAuthStore } from './stores/authStore';

// Lazy-loaded components
const Lovers = lazy(() => import("./TruthandDear-Component/Lovers"));
const ThankYou = lazy(() => import("./Components/ThankYou"));
const RockPaperScissors = lazy(() => import("./Components/RockPaperScissors"));
const Friends = lazy(() => import("./TruthandDear-Component/Friends"));
const LoveGameMode = lazy(() => import("./TruthandDear-Component/LoveGameMode"));
const FriendsGameMode = lazy(() => import("./TruthandDear-Component/FriendsGameMode"));
const GameScreen = lazy(() => import("./Components/GameScreen"));
const TruthOrDare = lazy(() => import("./TruthandDear-Component/TruthOrDare"));
const EmojiGame = lazy(() => import("./Emoji-Component/EmojiGame"));
const QRScanMode = lazy(() => import("./payment/QRScanMode"));
const Landing = lazy(() => import("./MainLanding"));
const TriviaGame = lazy(() => import("./Triva-Component/Trivia"));
const CafeOwnerCheckWinner = lazy(() => import("./Components/CafeOwnerCheckWinner"));
const Admin = lazy(() => import("./Components/admin/AdminPanel"));
const Login = lazy(() => import("./Components/auth/Login"));
const GameModeSelector = lazy(() => import("./Components/GameModeSelector"));

// Enhanced Card System Components
const EnhancedCardGenerator = lazy(() => import("./Components/EnhancedCardGenerator"));
const EnhancedQRScanner = lazy(() => import("./Components/EnhancedQRScanner"));
const WinnerCardGenerator = lazy(() => import("./Components/WinnerCardGenerator"));
const WinnerCardScanner = lazy(() => import("./Components/WinnerCardScanner"));

interface TimeContextType {
  remainingTime: number;
  startTimer: (duration: number) => void;
  pauseTimer: () => void;
  resetTimer: (options?: { time?: number; expire?: boolean }) => void;
  isExpired: boolean;
  formatTime: (seconds: number) => string;
}

export const TimeContext = createContext<TimeContextType | null>(null);

const TimeDisplay: React.FC = () => {
  const navigate = useNavigate();
  const { remainingTime, formatTime, endSession } = useSessionStore();

  useEffect(() => {
    if (remainingTime <= 30 && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    if (remainingTime <= 0) {
      endSession();
      navigate('/thank-you');
    }
  }, [remainingTime, navigate, endSession]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="w-full h-1 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
        <div
          className="progress-fill"
          style={{ width: `${((300 - remainingTime) / 300) * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-center py-3 px-6">
        <div className="flex items-center space-x-3">
          <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6"
            animate={{ 
              rotate: remainingTime <= 30 ? [0, 15, -15, 0] : 0,
            }}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </motion.svg>
          <motion.span 
            className="text-2xl font-bold tracking-wider"
            animate={
              remainingTime <= 30 
                ? { 
                    scale: [1, 1.1, 1],
                    transition: { duration: 0.5, repeat: Infinity } 
                  }
                : {}
            }
          >
            {formatTime(remainingTime)}
          </motion.span>
        </div>
      </div>
    </div>
  );
};

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { currentSession, isTimerActive } = useSessionStore();

  if (!currentSession?.isActive || !isTimerActive) {
    return <Navigate to="/game-select" replace state={{ fromGame: true }} />;
  }

  return React.cloneElement(children, {
    ...location.state
  });
};

const history = createBrowserHistory();

const App: React.FC = () => {
  const { remainingTime, isTimerActive, startTimer, pauseTimer, resetTimer, isExpired, formatTime } = useSessionStore();
  const { initialize } = useAuthStore();

  console.log("Timer active:", isTimerActive);
  console.log("Remaining time:", remainingTime);

  // Initialize auth on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

  const contextValue = useMemo(() => ({
    remainingTime,
    startTimer,
    pauseTimer,
    resetTimer,
    isExpired,
    formatTime
  }), [remainingTime, startTimer, pauseTimer, resetTimer, isExpired, formatTime]);

  // Initialize Sentry in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.init({
        dsn: "https://3fde7eac728bdae0b3212527b40231de@o4509093158912080.ingest.de.sentry.io/4509093158912080",
        tracesSampleRate: 1.0
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <TimeContext.Provider value={contextValue}>
        <HistoryRouter history={history as any} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {isTimerActive && <TimeDisplay />}
          <Suspense fallback={<div className="loading-spinner" />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Landing />} />
              <Route path="/game-select" element={<QRScanMode />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/lovers" element={<ProtectedRoute><Lovers /></ProtectedRoute>} />
              <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
              <Route path="/game-mode" element={<ProtectedRoute><LoveGameMode /></ProtectedRoute>} />
              <Route path="/friends-game-mode" element={<ProtectedRoute><FriendsGameMode /></ProtectedRoute>} />
              <Route path="/game-screen" element={<ProtectedRoute><GameScreen /></ProtectedRoute>} />
              <Route path="/qr-scan" element={<QRScanMode />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/trivia-game" element={<ProtectedRoute><TriviaGame /></ProtectedRoute>} />
              <Route path="/truth-or-dare" element={<ProtectedRoute><TruthOrDare /></ProtectedRoute>} />
              <Route path="/rock-paper-scissors" element={<ProtectedRoute><RockPaperScissors /></ProtectedRoute>} />
              <Route path="/emoji-game" element={<ProtectedRoute><EmojiGame /></ProtectedRoute>} />
              <Route path="/cafe-owner/check-winner" element={<CafeOwnerCheckWinner />} />
              
              {/* Enhanced Card System Routes */}
              <Route path="/enhanced-card-generator" element={<EnhancedCardGenerator />} />
              <Route path="/enhanced-scanner" element={<EnhancedQRScanner />} />
              <Route path="/winner-card-scanner" element={<WinnerCardScanner />} />
            </Routes>
          </Suspense>
        </HistoryRouter>
      </TimeContext.Provider>
    </ErrorBoundary>
  );
};

export default App;
