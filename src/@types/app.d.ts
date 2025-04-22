import React from 'react';

export interface TimeContextType {
  remainingTime: number;
  startTimer: (duration: number) => void;
  pauseTimer: () => void;
  resetTimer: (options?: { time?: number; expire?: boolean }) => void;
  isExpired: boolean;
  formatTime: (seconds: number) => string;
}

export const TimeContext: React.Context<TimeContextType>;

export default function App(): JSX.Element;
