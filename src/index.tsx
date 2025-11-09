import React from 'react';
import ReactDOM from 'react-dom/client';
import { SWRConfig } from 'swr';
import App from './App';
import './index.css';
import * as serviceWorkerRegistration from './utils/serviceWorkerRegistration';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Only use StrictMode in development to avoid double renders in production
// Optimize SWR config for better performance
const AppWrapper = (
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
const registerServiceWorker = () => {
  serviceWorkerRegistration.register({
    onSuccess: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Service Worker registered successfully');
      }
    },
    onUpdate: (registration) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('New service worker available. Reload to update.');
      }
      // Optionally show update notification to user
      if (window.confirm('New version available! Reload to update?')) {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    },
    onOfflineReady: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('App is ready to work offline');
      }
    },
  });
  serviceWorkerRegistration.listenForUpdates();
};

if (typeof window !== 'undefined' && window) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(registerServiceWorker, { timeout: 2000 });
  } else {
    // Fallback: register after page load
    const win = window as Window & typeof globalThis;
    win.addEventListener('load', () => {
      setTimeout(registerServiceWorker, 1000);
    });
  }
}
