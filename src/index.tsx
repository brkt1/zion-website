import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { SWRConfig } from 'swr';
import App from './App';
import ErrorBoundary from './Components/ui/ErrorBoundary';
import './index.css';
import { initGoogleAnalytics } from './services/googleAnalytics';
import { initializePolyfills } from './utils/polyfills';
import * as serviceWorkerRegistration from './utils/serviceWorkerRegistration';


// Extend Window interface to include Sentry
declare global {
  interface Window {
    Sentry?: typeof Sentry;
  }
}

// Initialize Sentry error monitoring (only in production if DSN is provided)
if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN) {
  const integrations: any[] = [];
  
  // Add BrowserTracing integration if available
  if (typeof Sentry.browserTracingIntegration === 'function') {
    integrations.push(Sentry.browserTracingIntegration());
  }
  
  // Add Replay integration if available
  if (typeof Sentry.replayIntegration === 'function') {
    integrations.push(
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      })
    );
  }

  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations,
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions will be sent to Sentry
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions will be recorded
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors will be recorded
    environment: process.env.REACT_APP_APP_ENV || 'production',
    beforeSend(event, hint) {
      // Don't send errors in development
      if (process.env.NODE_ENV === 'development') {
        return null;
      }
      return event;
    },
  });
}

// Make Sentry available globally for ErrorBoundary
if (typeof window !== 'undefined') {
  window.Sentry = Sentry;
}

// Initialize polyfills early
initializePolyfills();

// Initialize Google Analytics
initGoogleAnalytics();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Only use StrictMode in development to avoid double renders in production
// Optimize SWR config for better performance
const AppWrapper = (
  <ErrorBoundary>
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false, // Disable to reduce network activity
        shouldRetryOnError: true,
        errorRetryCount: 2, // Reduce retries for faster failure
        errorRetryInterval: 3000, // Reduce interval
        dedupingInterval: 2000, // Dedupe requests within 2s
        focusThrottleInterval: 5000, // Throttle focus revalidation
      }}
    >
      <App />
    </SWRConfig>
  </ErrorBoundary>
);

root.render(
  process.env.NODE_ENV === 'development' ? (
    <React.StrictMode>{AppWrapper}</React.StrictMode>
  ) : (
    AppWrapper
  )
);

// Defer service worker registration to avoid blocking main thread
// Register after page load to improve initial performance
window.addEventListener('load', () => {
  serviceWorkerRegistration.register({
    onUpdate: (registration) => {
      // When a new service worker is found, we want to inform the user
      // or automatically update. Here we'll notify that new content is available
      console.log('New content is available; please refresh.');
      
      // Optionally clear all caches to ensure fresh headers (like CSP)
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) caches.delete(name);
        });
      }
      
      // Send message to skip waiting and activate new worker immediately
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    },
  });
  
  // Listen for the controllerchange event to reload the page
  serviceWorkerRegistration.listenForUpdates();
});
