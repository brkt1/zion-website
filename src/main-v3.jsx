import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';
import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';

// Initialize Sentry with error boundary and more configuration
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'yenege.com',
    release: 'your-app-name@' + process.env.npm_package_version,
    environment: import.meta.env.MODE,
    integrations: [
      new BrowserTracing({
        tracingOrigins: ['localhost', 'your-production-domain.com'],
        routingInstrumentation: Sentry.reactRouterV6Instrumentation,
      }),
    ],
    tracesSampleRate: 0.2, // Reduced from 1.0 for production
    beforeSend(event) {
      // Filter out benign errors
      if (event.message?.includes('ResizeObserver')) return null;
      return event;
    },
  });
}

// Quagga initializer with better error handling
const initQuagga = async () => {
  try {
    const Quagga = await import(
      /* webpackIgnore: true */
      'https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js'

    );
    
    // Configure Quagga here
    console.log('Quagga initialized successfully');
  } catch (err) {
    console.error('Quagga initialization failed:', err);
    if (import.meta.env.PROD) {
      Sentry.captureException(err, {
        tags: { module: 'quagga' },
      });
    }
  }
};

// Enhanced Service Worker Registration
const registerServiceWorker = () => {
  const updateSW = registerSW({
    onNeedRefresh: () => {
      if (confirm('New version available! Reload to update?')) {
        updateSW(true);
      }
    },
    onOfflineReady: () => {
      console.log('App is ready for offline use');
    },
    onRegistered: (registration) => {
      if (!registration) return;
      console.log('Service Worker registered');
      
      // Check for updates hourly
      setInterval(() => {
        registration.update().catch(err => {
          console.log('SW update check failed:', err);
        });
      }, 60 * 60 * 1000);
      
      initQuagga(); // Initialize after SW registration
    },
    onRegisterError: (error) => {
      console.error('SW registration failed:', error);
      Sentry.captureException(error);
    },
  });
};

// Render App with error boundary
const RootComponent = () => (
  import.meta.env.DEV ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <Sentry.ErrorBoundary
      fallback={<div>An error occurred</div>}
      onError={(error) => {
        Sentry.captureException(error);
      }}
    >
      <App />
    </Sentry.ErrorBoundary>
  )
);

// Initialize the app
const startApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  // Prevent FOUC with better handling
  if (document.readyState === 'complete') {
    document.body.classList.add('loaded');
  } else {
    window.addEventListener('load', () => {
      document.body.classList.add('loaded');
    });
  }

  root.render(<RootComponent />);

  // Service Worker and Quagga initialization
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', registerServiceWorker);
  } else if (import.meta.env.DEV) {
    initQuagga();
  }
};

// Start the application
startApp();
