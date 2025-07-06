import React, { createContext, useEffect, useMemo, lazy, Suspense } from "react";
import * as Sentry from "@sentry/react";
import './App.css';
import ErrorBoundary from "./Components/ErrorBoundary";
import { unstable_HistoryRouter as HistoryRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { createBrowserHistory } from 'history';

import { motion } from 'framer-motion';
import { useSessionStore } from './stores/sessionStore';
import { useAuthStore } from './stores/authStore';

// Components to integrate
import LoadingSpinner from "./Components/LoadingSpinner";
import ErrorPage from "./Components/ErrorPage";
import { GameSessionGuard } from "./Components/GameSessionGuard";
import GameTimer from "./Components/GameTimer";

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
const CafeOwnerDashboard = lazy(() => import("./Components/admin/CafeOwnerDashboard"));
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



interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { currentSession, isTimerActive } = useSessionStore();

  if (!currentSession?.isActive || !isTimerActive) {
    return <Navigate to="/game-select" replace state={{ fromGame: true }} />;
  }

  // If a game session is active, prevent navigation away from game routes
  const allowedRoutes = ['/lovers', '/friends', '/game-mode', '/friends-game-mode', '/game-screen', '/trivia-game', '/truth-or-dare', '/rock-paper-scissors', '/emoji-game'];
  if (currentSession?.isActive && !allowedRoutes.includes(location.pathname)) {
    return <Navigate to="/game-screen" replace />;
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

  

  return (
    <ErrorBoundary>
      <TimeContext.Provider value={contextValue}>
        <HistoryRouter history={history as any} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {isTimerActive && <GameTimer />}
          <Suspense fallback={<LoadingSpinner />}>
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
              <Route path="/cafe-owner/dashboard" element={<CafeOwnerDashboard />} />
              
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
