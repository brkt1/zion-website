import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react({
      babel: {
        presets: ['@babel/preset-typescript'],
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
          ['@babel/plugin-transform-runtime', { 
            regenerator: true,
            helpers: true,
            useESModules: true
          }]
        ]
      },
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    }),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW', // Changed from injectManifest for better reliability
      includeAssets: ['**/*.{js,css,html,ico,png,svg,webp,woff2,json}'],
      manifest: {
        name: 'Yenege',
        short_name: 'Yenege',
        description: 'Future is now',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#4A90E2',
        orientation: 'portrait',
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
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,json}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          }
        ]
      },
      devOptions: {
        enabled: false, // Disabled in dev to prevent service worker conflicts
        type: 'module',
        navigateFallbackAllowlist: [/^\/$/]
      }
    })
  ],
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173
    },
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        connect-src 'self' https://*.supabase.co ws://localhost:5173;
        img-src 'self' data: blob: https://*.supabase.co;
        media-src 'self' blob:;
        worker-src 'self' blob:;
        font-src 'self' data:;
      `.replace(/\s+/g, ' ').trim()
    },
    port: 5173,
    strictPort: true,
    open: true
  },
  build: {
    target: 'esnext',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production'
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['html5-qrcode', 'zustand'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'html5-qrcode',
      '@supabase/supabase-js',
      'zustand'
    ],
    exclude: ['js-big-decimal']
  }
});