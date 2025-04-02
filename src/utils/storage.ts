import { z } from 'zod';
import useStoreWrapper from '../app/storeWrapper';

// Game State Schema
const GameStateSchema = z.object({
  isPlaying: z.boolean(),
  winner: z.string(),
  score: z.number().nonnegative(),
});

// Game-specific Implementations
export const gameStorage = {
  getGameState: () => {
    const { getGame } = useStoreWrapper;
    return getGame();
  },

  setGameState: (state: z.infer<typeof GameStateSchema>) => {
    const { setGameState } = useStoreWrapper;
    setGameState(state);
  },

  clearGameData: () => {
    const { setGameState } = useStoreWrapper;
    setGameState({ isPlaying: false, winner: '', score: 0 });
  },
};
