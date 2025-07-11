import React, { createContext, useEffect, useMemo } from "react";
import * as Sentry from "@sentry/react";
import './App.css';
import ErrorBoundary from "./Components/utility/ErrorBoundary";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { createBrowserHistory } from 'history';
import { useSessionStore } from './stores/sessionStore';
import { useAuthStore } from './stores/authStore';
import GameTimer from "./Components/game/GameTimer";
import AppRoutes from "./routes/AppRoutes";
import LoadingSpinner from "./Components/utility/LoadingSpinner";

interface TimeContextType {
  remainingTime: number;
  startTimer: (duration: number) => void;
  pauseTimer: () => void;
  resetTimer: (options?: { time?: number; expire?: boolean }) => void;
  isExpired: boolean;
  formatTime: (seconds: number) => string;
}

export const TimeContext = createContext<TimeContextType | null>(null);

const history = createBrowserHistory();

const App: React.FC = () => {
  const { remainingTime, isTimerActive, startTimer, pauseTimer, resetTimer, isExpired, formatTime } = useSessionStore();
  const { initialize, loading: authLoading } = useAuthStore();

  
  

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
          {authLoading ? (
            <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {isTimerActive && <GameTimer />}
              <AppRoutes />
            </>
          )}
        </HistoryRouter>
      </TimeContext.Provider>
    </ErrorBoundary>
  );
};

export default App;
