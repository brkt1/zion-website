import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
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
        // Exclude Quagga worker files from caching
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
          // Add Quagga worker exception
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
    headers: {
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache',
      // Security headers for camera access
      'Permissions-Policy': 'camera=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          quagga: ['quagga'], // Separate Quagga chunk
          vendor: ['lodash', 'moment']
        }
      },
      // Externalize worker dependencies
      external: ['quagga/dist/quagga.worker.js']
    }
  },
  optimizeDeps: {
    exclude: ['quagga'], // Prevent Quagga from being optimized
    include: ['react', 'react-dom']
  }
})