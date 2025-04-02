import { create } from 'zustand';

// Game State Store
interface GameState {
  isPlaying: boolean;
  winner: string;
  score: number;
  setGameState: (state: { isPlaying: boolean; winner: string; score: number }) => void;
}

export const useGameStore = create<GameState>((set) => ({
  isPlaying: false,
  winner: '',
  score: 0,
  setGameState: (state) => set(state),
}));

// Timer State Store
interface TimerState {
  remainingTime: number;
  isTimerActive: boolean;
  isExpired: boolean;
  startTimer: (time: number) => void;
  pauseTimer: () => void;
  resetTimer: (time: number) => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  remainingTime: 0,
  isTimerActive: false,
  isExpired: false,
  startTimer: (time) => set({ remainingTime: time, isTimerActive: true, isExpired: false }),
  pauseTimer: () => set({ isTimerActive: false }),
  resetTimer: (time) => set({ remainingTime: time, isTimerActive: false, isExpired: false }),
}));
