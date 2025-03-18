import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs' // Import fs module

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
        exclude: [/quagga\.worker\.js$/, /quagga\.min\.js$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 50, maxAgeSeconds: 21600 } // 6 hours
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 2592000 } // 30 days
            }
          },
          {
            urlPattern: /quagga\.worker\.js$/,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'quagga-worker-exception'
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
    https: process.env.NODE_ENV === 'production' ? true : false,
    headers: {
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache',
      'Permissions-Policy': 'camera=self',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      "Content-Security-Policy": "default-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline' 'unsafe-hashes' https://cdnjs.cloudflare.com; script-src-elem 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' 'unsafe-hashes'; style-src-attr 'self' 'unsafe-inline'; style-src-elem 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.example.com https://rpaxjodkgxfgneflavnj.supabase.co https://cdnjs.cloudflare.com; worker-src 'self';"
    }
  },
  build: {
    target: 'esnext'
  }
})
