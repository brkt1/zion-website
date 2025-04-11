import { create } from 'zustand';
import { supabase } from '../supabaseClient';

interface Card {
  id: number;
  duration: number;
  used: boolean;
  game_type: number;
  created_at: string;
  card_number: number;
  game_types?: { name: string };
}

interface CardState {
  cards: Card[];
  currentCard: Card | null;
  setCurrentCard: (card: Card) => void;
  markCardAsUsed: (cardId: number) => Promise<void>;
}

export const useCardStore = create<CardState>((set) => ({
  cards: [],
  currentCard: null,
  setCurrentCard: (card) => set({ currentCard: card }),
  markCardAsUsed: async (cardId) => {
    const { error } = await supabase
      .from('cards')
      .update({ used: true })
      .eq('id', cardId);
    if (!error) {
      set((state) => ({
        cards: state.cards.filter(card => card.id !== cardId)
      }));
    }
  }
}));

interface GameState {
  isPlaying: boolean;
  winner: string;
  score: number;
  setGameState: (state: Partial<GameState>) => void;
}

export const useGameStore = create<GameState>((set) => ({
  isPlaying: false,
  winner: '',
  score: 0,
  setGameState: (state) => set(state)
}));

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
  startTimer: (time) => set({ 
    remainingTime: time, 
    isTimerActive: true, 
    isExpired: false 
  }),
  pauseTimer: () => set({ isTimerActive: false }),
  resetTimer: (time) => set({ 
    remainingTime: time, 
    isTimerActive: false, 
    isExpired: false 
  })
}));