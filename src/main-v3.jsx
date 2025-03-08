import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'

// Conditional service worker registration
if (import.meta.env.PROD) {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('New version available! Reload to update?')) {
        updateSW(true)
      }
    },
    onOfflineReady() {
      console.log('App ready for offline use')
    },
    // Add these configurations
    onRegistered(registration) {
      console.log('Service Worker registered:', registration)
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error)
    }
  })
}

// Create root with strict mode only in development
const root = ReactDOM.createRoot(document.getElementById('root'))

const renderApp = () => root.render(
  import.meta.env.DEV ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  )
)

// Initialize app
if (import.meta.env.PROD) {
  // Production: Wait for service worker to be ready
  window.addEventListener('load', () => {
    setTimeout(renderApp, 1000) // Add slight delay for SW initialization
  })
} else {
  // Development: Immediate render
  renderApp()
}