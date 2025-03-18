import { Dispatch, SetStateAction } from 'react';

export interface TimeContextType {
  remainingTime: number;
  setRemainingTime: Dispatch<SetStateAction<number>>;
  startTimer: (initialTime: number) => void;
  pauseTimer: () => void;
  resetTimer: (initialTime: number) => void;
  formatTime: (seconds: number) => string;
  isExpired: boolean;
}
