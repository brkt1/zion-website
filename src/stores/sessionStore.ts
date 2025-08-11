import { create } from "zustand";
import { useAuthStore } from "./authStore";

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
  startTimer: (duration: number) => void;
  pauseTimer: () => void;
  resetTimer: (options?: {
    time?: number;
    expire?: boolean;
    keepActive?: boolean;
  }) => void;
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

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  remainingTime: 0,
  isTimerActive: false,
  isExpired: false,

  updateTimer: (remainingTime: number, isExpired: boolean) => {
    set({ remainingTime, isExpired });
    // Optionally, stop timer if expired
    if (isExpired) {
      set({ isTimerActive: false });
    }
    get().saveSession();
  },

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

      // Start the timer countdown
      get().startTimer(duration);
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

  startTimer: (duration: number) => {
    set({
      remainingTime: duration,
      isTimerActive: true,
      isExpired: false,
    });

    // Start countdown interval
    const interval = setInterval(() => {
      const { remainingTime, isTimerActive } = get();

      if (!isTimerActive) {
        clearInterval(interval);
        return;
      }

      if (remainingTime > 0) {
        set({ remainingTime: remainingTime - 1 });
        get().saveSession();
      } else {
        clearInterval(interval);
        set({
          remainingTime: 0,
          isTimerActive: false,
          isExpired: true,
        });
        get().endSession();
      }
    }, 1000);
  },

  pauseTimer: () => {
    set({ isTimerActive: false });
    get().saveSession();
  },

  resetTimer: (options = {}) => {
    const { time = 0, expire = false, keepActive = false } = options;
    set({
      remainingTime: time,
      isTimerActive: keepActive,
      isExpired: expire,
    });
    get().saveSession();
  },

  formatTime: (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
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
      const stored = localStorage.getItem("gameSession");
      if (stored) {
        const sessionData = JSON.parse(stored);
        const elapsed = Math.floor((Date.now() - sessionData.timestamp) / 1000);
        const newTime = Math.max(0, sessionData.remainingTime - elapsed);

        if (
          newTime > 0 &&
          sessionData.isTimerActive &&
          sessionData.session?.isActive
        ) {
          set({
            currentSession: sessionData.session,
            remainingTime: newTime,
            isTimerActive: true,
            isExpired: false,
          });
          get().startTimer(newTime);
        } else if (sessionData.session) {
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
}));

// Initialize session on app start
if (typeof window !== "undefined") {
  useSessionStore.getState().loadSession();

  // Handle visibility change for timer persistence
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      useSessionStore.getState().saveSession();
    } else {
      useSessionStore.getState().loadSession();
    }
  });
}
