import { z } from 'zod';
import useStore from '../app/storeWrapper';

// Game State Schema
const GameStateSchema = z.object({
  isPlaying: z.boolean(),
  winner: z.string(),
  score: z.number().nonnegative(),
});

// Function to check if local storage is available
export const canUseLocalStorage = () => {
  try {
    const testKey = '__test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

// Game-specific Implementations
export const gameStorage = {
  getGameState: () => {
    const { game } = useStore.getState(); // Access game state directly
    return game;
  },

  setGameState: (state: z.infer<typeof GameStateSchema>) => {
    useStore.getState().setGameState(state); // Call setGameState directly
  },

  clearGameData: () => {
    useStore.getState().setGameState({ isPlaying: false, winner: '', score: 0 });
  },
};
