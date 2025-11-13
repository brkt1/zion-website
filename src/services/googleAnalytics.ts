/**
 * Google Analytics Integration
 * 
 * Provides functions to track page views and events using Google Analytics.
 * Only initializes if REACT_APP_ANALYTICS_ID is provided.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Initialize Google Analytics
export const initGoogleAnalytics = (): void => {
  const analyticsId = process.env.REACT_APP_ANALYTICS_ID;
  const enableAnalytics = process.env.REACT_APP_ENABLE_ANALYTICS === 'true';

  if (!analyticsId || !enableAnalytics) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Google Analytics disabled or not configured');
    }
    return;
  }

  // Create dataLayer if it doesn't exist
  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  // Initialize gtag function
  window.gtag = function(...args: any[]) {
    window.dataLayer!.push(args);
  };

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
  document.head.appendChild(script);

  // Initialize GA
  window.gtag('js', new Date());
  window.gtag('config', analyticsId, {
    page_path: window.location.pathname,
    send_page_view: true,
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('Google Analytics initialized:', analyticsId);
  }
};

/**
 * Track a page view
 */
export const trackPageView = (path: string, title?: string): void => {
  if (!window.gtag) {
    return;
  }

  window.gtag('config', process.env.REACT_APP_ANALYTICS_ID, {
    page_path: path,
    page_title: title || document.title,
  });
};

/**
 * Track an event
 */
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  if (!window.gtag) {
    return;
  }

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

/**
 * Track a custom event with additional parameters
 */
export const trackCustomEvent = (eventName: string, parameters?: Record<string, any>): void => {
  if (!window.gtag) {
    return;
  }

  window.gtag('event', eventName, parameters);
};

// Common event tracking functions
export const analytics = {
  // Track button clicks
  trackButtonClick: (buttonName: string, location?: string) => {
    trackEvent('click', 'button', buttonName, undefined);
    if (location) {
      trackCustomEvent('button_click', { button_name: buttonName, location });
    }
  },

  // Track form submissions
  trackFormSubmit: (formName: string, success: boolean = true) => {
    trackEvent('submit', 'form', formName, success ? 1 : 0);
  },

  // Track external link clicks
  trackExternalLink: (url: string) => {
    trackEvent('click', 'external_link', url);
  },

  // Track file downloads
  trackDownload: (fileName: string, fileType?: string) => {
    trackEvent('download', 'file', fileName);
    if (fileType) {
      trackCustomEvent('file_download', { file_name: fileName, file_type: fileType });
    }
  },

  // Track video plays
  trackVideoPlay: (videoName: string) => {
    trackEvent('play', 'video', videoName);
  },

  // Track search queries
  trackSearch: (searchTerm: string, resultsCount?: number) => {
    trackEvent('search', 'site_search', searchTerm, resultsCount);
  },
};

