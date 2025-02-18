import { Context } from 'react';

export type TimeContextType = {
  remainingTime: number;
  isExpired: boolean;
  isTimerActive: boolean;
  formatTime: (time: number) => string;
  updateTimer: (remainingTime: number, isExpired: boolean) => void;
};

declare module '../App' {
  export const TimeContext: Context<TimeContextType>;
}
