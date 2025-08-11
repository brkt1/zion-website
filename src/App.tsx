import { createBrowserHistory } from "history";
import React, { createContext, useEffect, useMemo } from "react";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import "./App.css";
import GameTimer from "./Components/game/GameTimer";
import ErrorBoundary from "./Components/utility/ErrorBoundary";
import LoadingSpinner from "./Components/utility/LoadingSpinner";
import UserNav from "./Components/utility/UserNav";
import AppRoutes from "./routes/AppRoutes";
import { useAuthStore } from "./stores/authStore";
import { useSessionStore } from "./stores/sessionStore";

interface TimeContextType {
  remainingTime: number;
  startTimer: (duration: number) => void;
  pauseTimer: () => void;
  resetTimer: (options?: { time?: number; expire?: boolean }) => void;
  isExpired: boolean;
  formatTime: (seconds: number) => string;
  updateTimer: (remainingTime: number, isExpired: boolean) => void;
}

export const TimeContext = createContext<TimeContextType | null>(null);

const history = createBrowserHistory();

const App: React.FC = () => {
  const {
    remainingTime,
    isTimerActive,
    startTimer,
    pauseTimer,
    resetTimer,
    isExpired,
    formatTime,
    updateTimer,
  } = useSessionStore();
  const { initialize, loading: authLoading } = useAuthStore();

  // Initialize auth on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

  const contextValue = useMemo(
    () => ({
      remainingTime,
      startTimer,
      pauseTimer,
      resetTimer,
      isExpired,
      formatTime,
      updateTimer,
    }),
    [
      remainingTime,
      startTimer,
      pauseTimer,
      resetTimer,
      isExpired,
      formatTime,
      updateTimer,
    ]
  );

  return (
    <ErrorBoundary>
      <TimeContext.Provider value={contextValue}>
        <HistoryRouter
          history={history as any}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          {authLoading ? (
            <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <UserNav />
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
