import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
          ['@babel/plugin-transform-runtime', { regenerator: true }]
        ]
      },
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    }),
    VitePWA({
      registerType: 'prompt',
      strategies: 'generateSW',
      includeAssets: ['**/*.{js,css,html,ico,png,svg,json}'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 50, maxAgeSeconds: 21600 }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 2592000 }
            }
          }
        ]
      },
      manifest: {
        name: 'Yenege',
        short_name: 'Yenege',
        description: 'Future is now',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4A90E2',
        orientation: 'portrait',
        categories: ['productivity', 'social', 'utilities'],
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Login',
            short_name: 'Login',
            description: 'Access your account',
            url: '/login?source=pwa',
            icons: [{ src: '/icons/login-192.png', sizes: '192x192' }]
          }
        ]
      },
      devOptions: {
        enabled: false,
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ],
  server: {
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline' 'unsafe-eval' http://localhost:*; 
        style-src 'self' 'unsafe-inline' http://localhost:*; 
        connect-src 'self' https://*.supabase.co ws://localhost:*; 
        img-src 'self' data: https://*.supabase.co;
        media-src 'self' blob:;
        worker-src 'self' blob:;
        font-src 'self';
        frame-src 'none';
        object-src 'none';
      `.replace(/\n/g, ' ').trim()

    }
  },
  build: {
    target: 'esnext',
    sourcemap: process.env.NODE_ENV !== 'production'
  }
});
