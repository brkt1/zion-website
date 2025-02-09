/**
 * Secure storage utilities with error handling and validation
 */
import { validateGameState, validateWinnersList, ValidationResult } from './validation';

interface StorageError extends Error {
  type: 'STORAGE_ERROR' | 'VALIDATION_ERROR' | 'PARSE_ERROR';
}

const createError = (message: string, type: StorageError['type']): StorageError => {
  const error = new Error(message) as StorageError;
  error.type = type;
  return error;
};

const DEFAULT_GAME_STATE = {
  isPlaying: false,
  winner: '',
  score: 0
};

export const storage = {
  /**
   * Safely get data from localStorage with validation
   */
  get: <T>(key: string, validator: (data: any) => ValidationResult): T | null => {
    try {
      // Check if localStorage is available
      if (!window.localStorage) {
        throw createError('localStorage is not available', 'STORAGE_ERROR');
      }

      const data = localStorage.getItem(key);
      if (!data) return null;

      const parsedData = JSON.parse(data);
      const validationResult = validator(parsedData);

      if (!validationResult.isValid) {
        throw createError(validationResult.error || 'Invalid data format', 'VALIDATION_ERROR');
      }

      return parsedData as T;
    } catch (error) {
      console.error(`Error retrieving data from localStorage (${key}):`, error);
      return null;
    }
  },

  /**
   * Safely set data to localStorage with validation
   */
  set: <T>(key: string, data: T, validator: (data: any) => ValidationResult): boolean => {
    try {
      // Check if localStorage is available
      if (!window.localStorage) {
        throw createError('localStorage is not available', 'STORAGE_ERROR');
      }

      const validationResult = validator(data);
      if (!validationResult.isValid) {
        throw createError(validationResult.error || 'Invalid data format', 'VALIDATION_ERROR');
      }

      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving data to localStorage (${key}):`, error);
      return false;
    }
  },

  /**
   * Get game state with validation and fallback
   */
  getGameState: () => {
    const gameState = storage.get('gameState', validateGameState);
    return gameState || DEFAULT_GAME_STATE;
  },

  /**
   * Set game state with validation
   */
  setGameState: (state: typeof DEFAULT_GAME_STATE): boolean => {
    return storage.set('gameState', state, validateGameState);
  },

  /**
   * Get winners list with validation and fallback
   */
  getWinners: () => {
    const winners = storage.get<Array<{ name: string; date: string }>>('winners', validateWinnersList);
    return winners || [];
  },

  /**
   * Set winners list with validation
   */
  setWinners: (winners: Array<{ name: string; date: string }>): boolean => {
    return storage.set('winners', winners, validateWinnersList);
  },

  /**
   * Clear all game-related data from localStorage
   */
  clearGameData: () => {
    try {
      localStorage.removeItem('gameState');
      localStorage.removeItem('winners');
      return true;
    } catch (error) {
      console.error('Error clearing game data:', error);
      return false;
    }
  }
};

export default storage;
