import { create } from 'zustand';
import { supabase } from '../supabaseClient';

interface GameType {
  name: string;
}

interface Card {
  id: number;
  duration: number;
  used: boolean;
  game_type: number;
  created_at: string;
  card_number: string;
  game_types?: GameType;
}

interface CardState {
  cards: Card[];
  currentCard: Card | null;
  setCurrentCard: (card: Card) => void;
  markCardAsUsed: (cardId: number) => Promise<void>;
  fetchCards: () => Promise<void>;
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
        cards: state.cards.filter(card => card.id !== cardId),
        currentCard: state.currentCard?.id === cardId ? null : state.currentCard
      }));
    }
  },
  fetchCards: async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*, game_types(name)');
      
    if (!error && data) {
      set({ cards: data });
    }
  }
}));

interface GameState {
  isPlaying: boolean;
  winner: string;
  score: number;
  setGameState: (state: Partial<GameState>) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  isPlaying: false,
  winner: '',
  score: 0,
  setGameState: (state) => set(state),
  resetGame: () => set({ isPlaying: false, winner: '', score: 0 })
}));

interface TimerState {
  remainingTime: number;
  isTimerActive: boolean;
  isExpired: boolean;
  startTimer: (duration: number) => void;
  pauseTimer: () => void;
  resetTimer: (options?: { time?: number; expire?: boolean; keepActive?: boolean }) => void;
  formatTime: (seconds: number) => string;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  remainingTime: 0,
  isTimerActive: false,
  isExpired: false,
  startTimer: (duration) => {
    set({ 
      remainingTime: duration, 
      isTimerActive: true,
      isExpired: false 
    });
  },
  pauseTimer: () => {
    set({ isTimerActive: false });
  },
  resetTimer: (options = {}) => {
    const { time = 0, expire = false, keepActive = false } = options;
    set({ 
      remainingTime: time,
      isTimerActive: keepActive,
      isExpired: expire 
    });
  },
  formatTime: (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}));
