export declare const TimeService: {
    initializeTimer: (durationInMinutes: number) => number;
    getRemainingTime: () => number;
    isGameActive: () => boolean;
    clearTimer: () => void;
    formatRemainingTime: () => string;
  };