import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { TimeService } from "../services/timeService";

interface GameSession {
  id: string;
  playerId: string;
  playerName: string;
  gameTypeId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  isActive: boolean;
  score: number;
  stage: number;
  streak: number;
}

interface SessionState {
  currentSession: GameSession | null;
  remainingTime: number;
  isTimerActive: boolean;
  isExpired: boolean;

  // Actions
  startSession: (
    gameTypeId: string,
    playerName: string,
    duration: number
  ) => Promise<void>;
  endSession: (finalScore?: number) => Promise<void>;
  updateScore: (score: number, stage?: number, streak?: number) => void;
  formatTime: (seconds: number) => string;

  // Session persistence
  saveSession: () => void;
  loadSession: () => void;
  clearSession: () => void;
}

const API_BASE_URL = "http://localhost:3001/api";

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generatePlayerId = () => {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useSessionStore = create<SessionState>((set, get) => {
  // Initial state
  set({
    currentSession: null,
    remainingTime: 0,
    isTimerActive: false,
    isExpired: false,
  });

  // Function to handle TimeService updates
  const handleTimeServiceUpdate = (state: any) => {
    set({
      remainingTime: state.remainingTime,
      isTimerActive: state.isActive,
      isExpired: state.isExpired,
    });
    if (state.isExpired) {
      // Defer endSession call to ensure it's available
      queueMicrotask(() => {
        get().endSession();
      });
    }
  };

  // Subscribe to TimeService updates
  TimeService.subscribe(handleTimeServiceUpdate);

  return {
    currentSession: null, // Reset initial state here as well
    remainingTime: 0,
    isTimerActive: false,
    isExpired: false,

    startSession: async (
      gameTypeId: string,
      playerName: string,
      duration: number
    ) => {
      try {
        const sessionId = generateSessionId();
        const playerId = generatePlayerId();

        const session: GameSession = {
          id: sessionId,
          playerId,
          playerName,
          gameTypeId,
          startTime: new Date(),
          duration,
          isActive: true,
          score: 0,
          stage: 1,
          streak: 0,
        };

        set({
          currentSession: session,
          remainingTime: duration,
          isTimerActive: true,
          isExpired: false,
        });

        // Save to localStorage for persistence
        get().saveSession();

        // Initialize and start TimeService
        TimeService.initializeTimer(duration / 60); // duration is in seconds, convert to minutes
        TimeService.start();
      } catch (error) {
        console.error("Failed to start session:", error);
        throw error;
      }
    },

    endSession: async (finalScore?: number) => {
      try {
        const { currentSession } = get();
        if (!currentSession) return;

        const authStore = useAuthStore.getState();

        // Update session with end time and final score
        const updatedSession = {
          ...currentSession,
          endTime: new Date(),
          isActive: false,
          score: finalScore ?? currentSession.score,
        };

        set({
          currentSession: updatedSession,
          isTimerActive: false,
          isExpired: true,
        });

        // Stop TimeService
        TimeService.expire();

        // Save final score to backend if authenticated
        if (authStore.session?.access_token) {
          try {
            await fetch(`${API_BASE_URL}/scores`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${authStore.session.access_token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                playerName: updatedSession.playerName,
                playerId: updatedSession.playerId,
                score: updatedSession.score,
                stage: updatedSession.stage,
                sessionId: updatedSession.id,
                streak: updatedSession.streak,
                gameTypeId: updatedSession.gameTypeId,
              }),
            });
          } catch (error) {
            console.error("Failed to save score to backend:", error);
          }
        }

        // Clear session after a delay
        setTimeout(() => {
          get().clearSession();
        }, 5000);
      } catch (error) {
        console.error("Failed to end session:", error);
      }
    },

    updateScore: (score: number, stage?: number, streak?: number) => {
      const { currentSession } = get();
      if (!currentSession) return;

      const updatedSession = {
        ...currentSession,
        score,
        stage: stage ?? currentSession.stage,
        streak: streak ?? currentSession.streak,
      };

      set({ currentSession: updatedSession });
      get().saveSession();
    },

    formatTime: (seconds: number) => {
      return TimeService.formatTime(seconds);
    },

    saveSession: () => {
      const { currentSession, remainingTime, isTimerActive, isExpired } = get();
      if (currentSession) {
        const sessionData = {
          session: currentSession,
          remainingTime,
          isTimerActive,
          isExpired,
          timestamp: Date.now(),
        };
        localStorage.setItem("gameSession", JSON.stringify(sessionData));
      }
    },

    loadSession: () => {
      try {
        TimeService.loadFromStorage();
        const { remainingTime, isActive, isExpired, duration, startTime } = TimeService.getState();

        if (remainingTime > 0 && isActive) {
          const storedSession = localStorage.getItem("gameSession");
          if (storedSession) {
            const sessionData = JSON.parse(storedSession);
            set({
              currentSession: sessionData.session,
              remainingTime,
              isTimerActive: isActive,
              isExpired,
            });
            TimeService.start(); // Restart TimeService if it was active
          }
        } else if (isExpired) {
          const storedSession = localStorage.getItem("gameSession");
          if (storedSession) {
            const sessionData = JSON.parse(storedSession);
            set({
              currentSession: { ...sessionData.session, isActive: false },
              remainingTime: 0,
              isTimerActive: false,
              isExpired: true,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load session:", error);
        get().clearSession();
      }
    },

    clearSession: () => {
      set({
        currentSession: null,
        remainingTime: 0,
        isTimerActive: false,
        isExpired: false,
      });
      localStorage.removeItem("gameSession");
    },
  };
});

  