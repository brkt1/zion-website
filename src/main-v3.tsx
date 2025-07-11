import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';
import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';

// Initialize Sentry only in production
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.2,
    beforeSend(event) {
      // Filter out benign errors
      if (event.message?.includes('ResizeObserver')) return null;
      return event;
    }
  });
}

// Error Boundary Component
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-screen bg-black ">
        <div className="p-6 bg-bl rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Something went wrong
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Root Component
const RootComponent = () => (
  <ErrorBoundary>
    {import.meta.env.DEV ? (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    ) : (
      <App />
    )}
  </ErrorBoundary>
);

// Service Worker Registration
const registerServiceWorker = () => {
  const updateSW = registerSW({
    onNeedRefresh: () => {
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-white p-4 shadow-lg rounded-lg border';
      toast.innerHTML = `
        <p class="mb-2">New version available!</p>
        <button class="px-3 py-1 bg-blue-500 text-white rounded mr-2">Update</button>
        <button class="px-3 py-1 bg-gray-200 rounded">Dismiss</button>
      `;
      document.body.appendChild(toast);
      
      toast.querySelector('button:first-child').onclick = () => {
        updateSW(true);
        toast.remove();
      };
      toast.querySelector('button:last-child').onclick = () => toast.remove();
    },
    onOfflineReady: () => {
      
    },
  });
};

// Initialize App
const startApp = () => {
  if ('serviceWorker' in navigator) {
    registerServiceWorker();
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<RootComponent />);
};

startApp();