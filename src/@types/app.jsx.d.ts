declare module '../App.jsx' {
  import { Context } from 'react';
  
  interface TimeContextType {
    remainingTime: number;
    isExpired: boolean;
    isTimerActive: boolean;
    formatTime: (seconds: number) => string;
    updateTimer: (remainingTime: number, isExpired: boolean) => void;
    startTimer: (initialTime: number) => void;
    pauseTimer: () => void;
    resetTimer: (initialTime: number) => void;
  }

  export const TimeContext: Context<TimeContextType>;
}
