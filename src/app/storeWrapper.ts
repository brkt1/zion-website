import {create} from 'zustand';

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

// Create a private store wrapper
const createStoreWrapper = () => {
  const { game, timer, setGameState, startTimer, pauseTimer, resetTimer } = useStore();

  return {
    getGame: () => ({ ...game }), // Return a copy of the game state
    getTimer: () => ({ ...timer }), // Return a copy of the timer state
    setGameState, // Expose this method
    startTimer,   // Expose this method
    pauseTimer,   // Expose this method
    resetTimer,   // Expose this method
    // Other methods can be added here as needed
  };
};

const useStoreWrapper = createStoreWrapper();

export default useStoreWrapper;
