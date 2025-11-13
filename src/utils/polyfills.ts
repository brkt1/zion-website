/**
 * Browser Compatibility Polyfills and Feature Detection
 * Ensures the website works correctly across all modern browsers
 */

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Safe localStorage wrapper with fallback to in-memory storage
 */
class SafeStorage {
  private memoryStorage: Map<string, string> = new Map();
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = isLocalStorageAvailable();
  }

  getItem(key: string): string | null {
    if (this.isAvailable) {
      try {
        return localStorage.getItem(key);
      } catch {
        return this.memoryStorage.get(key) || null;
      }
    }
    return this.memoryStorage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    if (this.isAvailable) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch {
        // Fallback to memory storage
      }
    }
    this.memoryStorage.set(key, value);
  }

  removeItem(key: string): void {
    if (this.isAvailable) {
      try {
        localStorage.removeItem(key);
        return;
      } catch {
        // Fallback to memory storage
      }
    }
    this.memoryStorage.delete(key);
  }

  clear(): void {
    if (this.isAvailable) {
      try {
        localStorage.clear();
        return;
      } catch {
        // Fallback to memory storage
      }
    }
    this.memoryStorage.clear();
  }
}

// Export safe storage instance
export const safeStorage = new SafeStorage();

/**
 * Check if window.atob is available (for base64 decoding)
 */
export const isAtobAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.atob === 'function';
};

/**
 * Safe atob wrapper with fallback
 */
export const safeAtob = (str: string): string => {
  if (isAtobAvailable()) {
    try {
      return window.atob(str);
    } catch {
      // Fallback implementation
    }
  }
  
  // Fallback implementation for atob
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  
  str = str.replace(/[=]+$/, '');
  
  for (let i = 0; i < str.length; i += 4) {
    const enc1 = chars.indexOf(str.charAt(i));
    const enc2 = chars.indexOf(str.charAt(i + 1));
    const enc3 = chars.indexOf(str.charAt(i + 2));
    const enc4 = chars.indexOf(str.charAt(i + 3));
    
    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;
    
    output += String.fromCharCode(chr1);
    
    if (enc3 !== 64) {
      output += String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output += String.fromCharCode(chr3);
    }
  }
  
  return output;
};

/**
 * Check if URL constructor is available
 */
export const isURLSupported = (): boolean => {
  return typeof URL !== 'undefined' && typeof URL.prototype !== 'undefined';
};

/**
 * Check if fetch API is available
 */
export const isFetchAvailable = (): boolean => {
  return typeof fetch !== 'undefined';
};

/**
 * Check if Promise is available
 */
export const isPromiseSupported = (): boolean => {
  return typeof Promise !== 'undefined';
};

/**
 * Check if Array.from is available
 */
export const isArrayFromSupported = (): boolean => {
  return typeof Array !== 'undefined' && typeof Array.from === 'function';
};

/**
 * Check if matchMedia is available
 */
export const isMatchMediaSupported = (): boolean => {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
};

/**
 * Safe matchMedia wrapper
 */
export const safeMatchMedia = (query: string): MediaQueryList | null => {
  if (isMatchMediaSupported()) {
    try {
      return window.matchMedia(query);
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Check if requestIdleCallback is available
 */
export const isRequestIdleCallbackSupported = (): boolean => {
  return typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function';
};

/**
 * Polyfill for requestIdleCallback
 */
export const requestIdleCallbackPolyfill = (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number => {
  if (isRequestIdleCallbackSupported()) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback: use setTimeout
  const timeout = options?.timeout || 0;
  const start = Date.now();
  
  return window.setTimeout(() => {
    callback({
      didTimeout: timeout > 0 && Date.now() - start >= timeout,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1) as unknown as number;
};

/**
 * Cancel idle callback polyfill
 */
export const cancelIdleCallbackPolyfill = (handle: number): void => {
  if (typeof window !== 'undefined' && typeof window.cancelIdleCallback === 'function') {
    window.cancelIdleCallback(handle);
  } else {
    clearTimeout(handle);
  }
};

/**
 * Check browser compatibility and return a compatibility report
 */
export const checkBrowserCompatibility = (): {
  compatible: boolean;
  issues: string[];
  warnings: string[];
} => {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Critical features
  if (!isPromiseSupported()) {
    issues.push('Promise is not supported. This browser is too old.');
  }

  if (!isFetchAvailable()) {
    warnings.push('Fetch API is not available. Some features may not work.');
  }

  if (!isURLSupported()) {
    warnings.push('URL constructor is not available. Some features may not work.');
  }

  if (!isArrayFromSupported()) {
    warnings.push('Array.from is not available. Some features may not work.');
  }

  // Non-critical features
  if (!isLocalStorageAvailable()) {
    warnings.push('localStorage is not available. Preferences will not be saved.');
  }

  if (!isAtobAvailable()) {
    warnings.push('atob is not available. Some features may not work.');
  }

  if (!isMatchMediaSupported()) {
    warnings.push('matchMedia is not available. Responsive features may not work correctly.');
  }

  return {
    compatible: issues.length === 0,
    issues,
    warnings,
  };
};

/**
 * Initialize polyfills on page load
 */
export const initializePolyfills = (): void => {
  // Polyfill for Array.from if needed
  if (!isArrayFromSupported() && typeof Array !== 'undefined') {
    (Array as any).from = function <T>(arrayLike: ArrayLike<T>): T[] {
      const result: T[] = [];
      for (let i = 0; i < arrayLike.length; i++) {
        result[i] = arrayLike[i];
      }
      return result;
    };
  }

  // Log compatibility report in development
  if (process.env.NODE_ENV === 'development') {
    const report = checkBrowserCompatibility();
    if (report.issues.length > 0 || report.warnings.length > 0) {
      console.warn('Browser Compatibility Report:', report);
    }
  }
};

// Auto-initialize on import
if (typeof window !== 'undefined') {
  initializePolyfills();
}

