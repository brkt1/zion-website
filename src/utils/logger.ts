/**
 * Logger utility for production-safe logging
 * Only logs in development mode to avoid exposing sensitive information in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.REACT_APP_DEBUG === 'true';

export const logger = {
  /**
   * Log debug information (only in development or when DEBUG is enabled)
   */
  log: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.log(...args);
    }
  },

  /**
   * Log warnings (always logged, but can be filtered in production)
   */
  warn: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.warn(...args);
    }
  },

  /**
   * Log errors (always logged for production debugging)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log info messages (only in development)
   */
  info: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.info(...args);
    }
  },
};

