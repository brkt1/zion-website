import SafeStorage from '../utils/safeStorage';

const safeStorage = new SafeStorage();

// Centralized Timer Service - Single source of truth for all timer operations
class TimeServiceClass {
  constructor() {
    this.remainingTime = 0;
    this.isActive = false;
    this.interval = null;
    this.callbacks = [];
    this.startTime = null;
    this.duration = 0;
    this.isExpired = false;
  }

  // Initialize timer with duration in minutes
  initializeTimer(durationMinutes) {
    this.duration = durationMinutes * 60; // Convert to seconds
    this.remainingTime = this.duration;
    this.isActive = false;
    this.isExpired = false;
    this.startTime = null;
    this.clearInterval();
    this.saveToStorage();
    this.notifyCallbacks();
  }

  // Start the timer
  start() {
    if (this.isActive || this.remainingTime <= 0) return;
    
    this.isActive = true;
    this.isExpired = false;
    this.startTime = Date.now();
    this.saveToStorage();
    
    this.interval = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.saveToStorage();
        this.notifyCallbacks();
        
        // Vibrate when time is running low
        if (this.remainingTime <= 30 && 'vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      } else {
        this.expire();
      }
    }, 1000);
    
    this.notifyCallbacks();
  }

  // Pause the timer
  pause() {
    this.isActive = false;
    this.clearInterval();
    this.saveToStorage();
    this.notifyCallbacks();
  }

  // Reset timer
  reset(options = {}) {
    const { time = null, expire = false, keepActive = false } = options;
    
    this.clearInterval();
    this.isActive = keepActive;
    this.isExpired = expire;
    this.remainingTime = time !== null ? time : this.duration;
    this.startTime = keepActive ? Date.now() : null;
    
    this.saveToStorage();
    this.notifyCallbacks();
  }

  // Timer expiration
  expire() {
    this.isActive = false;
    this.isExpired = true;
    this.remainingTime = 0;
    this.clearInterval();
    this.saveToStorage();
    this.notifyCallbacks({ expired: true });
  }

  // Add callback for timer updates
  subscribe(callback) {
    this.callbacks.push(callback);
    // Immediately call with current state
    callback(this.getState());
    
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  // Notify all subscribers
  notifyCallbacks(extra = {}) {
    const state = {
      ...this.getState(),
      ...extra
    };
    
    this.callbacks.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Timer callback error:', error);
      }
    });
  }

  // Clear interval
  clearInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  // Get current state
  getState() {
    return {
      remainingTime: this.remainingTime,
      isActive: this.isActive,
      isExpired: this.isExpired,
      duration: this.duration,
      startTime: this.startTime
    };
  }

  // Format time for display
  formatTime(seconds = this.remainingTime) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Save state to storage
  saveToStorage() {
    const state = {
      remainingTime: this.remainingTime,
      isActive: this.isActive,
      isExpired: this.isExpired,
      duration: this.duration,
      startTime: this.startTime,
      timestamp: Date.now()
    };
    safeStorage.setItem('timer_state', JSON.stringify(state));
  }

  // Load state from storage
  loadFromStorage() {
    try {
      const stored = safeStorage.getItem('timer_state');
      if (!stored) return;

      const state = JSON.parse(stored);
      const now = Date.now();
      const timeDiff = Math.floor((now - state.timestamp) / 1000);

      this.duration = state.duration || 0;
      this.isExpired = state.isExpired || false;
      this.startTime = state.startTime;

      if (state.isActive && !this.isExpired) {
        // Adjust remaining time based on elapsed time
        this.remainingTime = Math.max(0, state.remainingTime - timeDiff);
        this.isActive = this.remainingTime > 0;
        
        if (this.remainingTime <= 0) {
          this.expire();
        }
      } else {
        this.remainingTime = state.remainingTime || 0;
        this.isActive = false;
      }
    } catch (error) {
      console.error('Failed to load timer state:', error);
      this.clearStorage();
    }
  }

  // Clear storage
  clearStorage() {
    safeStorage.removeItem('timer_state');
    safeStorage.removeItem('game_timer_expiry'); // Legacy cleanup
  }

  // Check if game is active (for backward compatibility)
  isGameActive() {
    return this.isActive && this.remainingTime > 0 && !this.isExpired;
  }

  // Get remaining time in milliseconds (for backward compatibility)
  getRemainingTime() {
    return this.remainingTime * 1000;
  }

  // Format remaining time (for backward compatibility)
  formatRemainingTime() {
    return this.formatTime();
  }

  // Clear timer (for backward compatibility)
  clearTimer() {
    this.reset();
    this.clearStorage();
  }

  // Cleanup
  destroy() {
    this.clearInterval();
    this.callbacks = [];
    this.clearStorage();
  }
}

// Create singleton instance
export const TimeService = new TimeServiceClass();
export default TimeService;
