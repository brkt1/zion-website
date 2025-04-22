// utils/timeService.js
export const TimeService = {
    initializeTimer: (durationInMinutes) => {
      const durationMs = durationInMinutes * 60 * 1000;
      const expiryTime = Date.now() + durationMs;
      safeStorage.set('game_timer_expiry', expiryTime.toString());
      return durationMs;
    },
  
    getRemainingTime: () => {
      const expiryTime = parseInt(safeStorage.get('game_timer_expiry'));
      if (!expiryTime) return 0;
      return Math.max(0, expiryTime - Date.now());
    },
  
    isGameActive: () => {
      return TimeService.getRemainingTime() > 0;
    },
  
    clearTimer: () => {
      safeStorage.remove('game_timer_expiry');
    },
  
    formatRemainingTime: () => {
      const ms = TimeService.getRemainingTime();
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };