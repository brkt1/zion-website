import { create } from 'zustand';

// Define the state interface
interface GameState {
  isPlaying: boolean;
  winner: string;
  score: number;
}

// Define the timer state interface
interface TimerState {
  remainingTime: number;
  isTimerActive: boolean;
  isExpired: boolean;
}

// Create the Zustand store
const useStore = create<{
  game: GameState;
  timer: TimerState;
  setGameState: (state: GameState) => void;
  startTimer: (time: number) => void;
  pauseTimer: () => void;
  resetTimer: (time: number) => void;
}>((set) => ({
  game: {
    isPlaying: false,
    winner: '',
    score: 0,
  },
  timer: {
    remainingTime: 0,
    isTimerActive: false,
    isExpired: false,
  },
  setGameState: (state) => set((prev) => ({ game: { ...prev.game, ...state } })),
  startTimer: (time) => set({ timer: { remainingTime: time, isTimerActive: true, isExpired: false } }),
  pauseTimer: () => set((prev) => ({ timer: { ...prev.timer, isTimerActive: false } })),
  resetTimer: (time) => set({ timer: { remainingTime: time, isTimerActive: false, isExpired: false } }),
}));

export default useStore;
