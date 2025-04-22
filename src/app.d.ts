// app.d.ts
import { Context } from 'react';

export type TimeContextType = {
  remainingTime: number;
  isExpired: boolean;
  formatTime: (time: number) => string;
  updateTimer: (remainingTime: number, isExpired: boolean) => void;
};

declare module '../App' {
  export const TimeContext: Context<TimeContextType>;
}
