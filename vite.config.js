import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Set API base URL based on environment
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.yenege.com/api"
    : "http://localhost:3001/api";

export default defineConfig({
  define: {
    "process.env": {},
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify(API_BASE_URL),
  },
  plugins: [
    react({
      babel: {
        presets: ["@babel/preset-typescript"],
        plugins: [
          ["@babel/plugin-transform-react-jsx", { runtime: "automatic" }],
          [
            "@babel/plugin-transform-runtime",
            {
              regenerator: true,
              helpers: true,
              useESModules: true,
            },
          ],
        ],
      },
      jsxRuntime: "automatic",
      jsxImportSource: "react",
    }),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "generateSW",
      includeAssets: ["**/*.{js,css,html,ico,png,svg,webp,woff2,json}"],
      manifest: {
        name: "Yenege",
        short_name: "Yenege",
        description: "Future is now",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#4A90E2",
        orientation: "portrait",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2,json}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.yenege\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
        type: "module",
        navigateFallbackAllowlist: [/^\/$/],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    },
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
      clientPort: 5173,
    },
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net 'unsafe-inline' 'unsafe-eval' http://localhost:* https://www.gstatic.com https://translate.google.com; connect-src 'self' https://*.supabase.co ws://localhost:5173 http://localhost:3001 https://api.yenege.com https://api.yenege.com/api/* https://*.ingest.sentry.io https://www.gstatic.com https://translate.google.com https://fonts.gstatic.com https://lh3.googleusercontent.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:; img-src 'self' data: https: https://www.gstatic.com https://fonts.gstatic.com https://lh3.googleusercontent.com; media-src 'self'; worker-src 'self' blob:;",
    },
    port: 5173,
    strictPort: true,
    open: true,
  },
  build: {
    target: "esnext",
    sourcemap: process.env.NODE_ENV !== "production",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          vendor: ["html5-qrcode", "zustand"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "html5-qrcode",
      "@supabase/supabase-js",
      "zustand",
    ],
    exclude: ["js-big-decimal"],
  },
});
