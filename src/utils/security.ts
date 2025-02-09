/**
 * Security utilities for input sanitization and visibility handling
 */
import DOMPurify from 'dompurify';

export const security = {
  /**
   * Sanitize user input to prevent XSS attacks
   */
  sanitizeInput: (input: string): string => {
    if (typeof input !== 'string') {
      return '';
    }
    return DOMPurify.sanitize(input.trim());
  },

  /**
   * Check if the page is visible
   */
  isPageVisible: (): boolean => {
    return document.visibilityState === 'visible';
  },

  /**
   * Add visibility change listener
   */
  onVisibilityChange: (callback: (isVisible: boolean) => void): (() => void) => {
    const handler = () => {
      callback(document.visibilityState === 'visible');
    };
    
    document.addEventListener('visibilitychange', handler);
    
    // Return cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handler);
    };
  },

  /**
   * Get current timestamp with validation
   * This helps prevent timer manipulation
   */
  getValidatedTimestamp: (): number => {
    const now = Date.now();
    const lastTimestamp = parseInt(sessionStorage.getItem('lastTimestamp') || '0', 10);
    
    // Ensure time only moves forward
    if (now < lastTimestamp) {
      console.warn('Invalid timestamp detected');
      return lastTimestamp;
    }
    
    sessionStorage.setItem('lastTimestamp', now.toString());
    return now;
  },

  /**
   * Validate time difference
   * Returns true if the time difference is valid
   */
  validateTimeDifference: (startTime: number, endTime: number, expectedDiff: number): boolean => {
    const actualDiff = endTime - startTime;
    const tolerance = 1000; // 1 second tolerance
    
    return Math.abs(actualDiff - expectedDiff) <= tolerance;
  }
};

/**
 * Timer security wrapper
 * Ensures timer cannot be manipulated when page is hidden
 */
export class SecureTimer {
  private startTime: number;
  private pausedTime: number;
  private remainingTime: number;
  private isRunning: boolean;
  private visibilityCleanup: (() => void) | null;

  constructor(initialTime: number) {
    this.startTime = security.getValidatedTimestamp();
    this.pausedTime = 0;
    this.remainingTime = initialTime;
    this.isRunning = false;
    this.visibilityCleanup = null;
  }

  start(): void {
    if (!this.isRunning) {
      this.startTime = security.getValidatedTimestamp();
      this.isRunning = true;
      
      // Handle visibility changes
      this.visibilityCleanup = security.onVisibilityChange((isVisible) => {
        if (!isVisible) {
          this.pause();
        }
      });
    }
  }

  pause(): void {
    if (this.isRunning) {
      this.pausedTime = security.getValidatedTimestamp();
      this.remainingTime -= (this.pausedTime - this.startTime);
      this.isRunning = false;
    }
  }

  resume(): void {
    if (!this.isRunning && security.isPageVisible()) {
      this.startTime = security.getValidatedTimestamp();
      this.isRunning = true;
    }
  }

  stop(): void {
    this.isRunning = false;
    if (this.visibilityCleanup) {
      this.visibilityCleanup();
      this.visibilityCleanup = null;
    }
  }

  getRemainingTime(): number {
    if (!this.isRunning) {
      return this.remainingTime;
    }
    
    const now = security.getValidatedTimestamp();
    const elapsed = now - this.startTime;
    return Math.max(0, this.remainingTime - elapsed);
  }
}
