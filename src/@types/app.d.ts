import { Context } from 'react';

interface TimeContextType {
  remainingTime: number;
  isExpired: boolean;
  formatTime: (seconds: number) => string;
  setRemainingTime: (time: number) => void;
  startTimer: (initialTime: number) => void;
  pauseTimer: () => void;
  resetTimer: (initialTime: number) => void;
}

declare module '../App' {
  export const TimeContext: Context<TimeContextType>;
}
