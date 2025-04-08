import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

// Initialize Sentry
Sentry.init({
  dsn: 'https://3fde7eac728bdae0b3212527b40231de@o4509093151899648.ingest.de.sentry.io/4509093158912080',
  integrations: [
    new Integrations.BrowserTracing({
      tracingOrigins: ['localhost', 'https://your-production-url.com'],
    }),
  ],
  tracesSampleRate: 1.0, // Adjust this value in production
});

// Conditional service worker registration
if (import.meta.env.PROD) {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('New version available! Reload to update?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('App ready for offline use');
    },
    onRegistered(registration) {
      console.log('Service Worker registered:', registration);
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    },
  });
}

// Create root with strict mode only in development
const root = ReactDOM.createRoot(document.getElementById('root'));

const renderApp = () => root.render(
  import.meta.env.DEV ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  )
);

// Initialize app
if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    setTimeout(renderApp, 1000); // Add slight delay for SW initialization
  });
} else {
  renderApp();
}
