const CACHE_VERSION = 'v2'; // Incremented version
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMMUTABLE_CACHE = `immutable-${CACHE_VERSION}`;

// Pre-cache core assets
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/public/manifest.json', // Updated path
  'offline.png' // Updated path
];

// Immutable assets (cache forever)
const IMMUTABLE_ASSETS = [
  '/Dare 1.png',
  '/image 1.png',
  '/image 2.png',
  '/social-preview.png',
  '/zionlogo.png'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_ASSETS)),
      caches.open(IMMUTABLE_CACHE).then(cache => cache.addAll(IMMUTABLE_ASSETS))
    ])
    .then(() => {
      console.log('Caching complete');
      return self.skipWaiting();
    })
    .catch(err => {
      console.error('Pre-caching failed:', err);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (![STATIC_CACHE, DYNAMIC_CACHE, IMMUTABLE_CACHE].includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
    .then(() => {
      console.log('Service Worker activated');
    })
  );
});

// Enhanced fetch handler with better bypass rules
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  // Bypass conditions
  const shouldBypass = 
    // External resources
    requestUrl.hostname !== self.location.hostname ||
    // Development tools
    requestUrl.pathname.includes('@vite') ||
    requestUrl.pathname.includes('__webpack') ||
    // API requests
    requestUrl.pathname.startsWith('/graphql/') ||
    requestUrl.pathname.startsWith('/api/') ||
    // Non-GET requests
    request.method !== 'GET' ||
    // WebSockets
    requestUrl.protocol === 'ws:' || 
    requestUrl.protocol === 'wss:' ||
    // Source maps
    requestUrl.pathname.endsWith('.map');

  if (shouldBypass) {
    return fetch(request);
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    return event.respondWith(
      handleNavigationRequest(request)
    );
  }

  // Handle asset requests
  return event.respondWith(
    handleAssetRequest(request)
  );
});

// Network-first strategy for HTML
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || caches.match('/offline.html');
  }
}

// Cache-first strategy for assets
async function handleAssetRequest(request) {
  try {
    // Check immutable cache first
    if (IMMUTABLE_ASSETS.some(asset => request.url.endsWith(asset))) {
      const immutableResponse = await caches.match(request, { cacheName: IMMUTABLE_CACHE });
      if (immutableResponse) return immutableResponse;
    }

    // Check dynamic cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Fetch failed:', error);
    return serveFallbackResponse(request);
  }
}

// Fallback responses
async function serveFallbackResponse(request) {
  // Image fallback
  if (request.headers.get('accept').includes('image')) {
    return caches.match('/images/offline.png') || 
           new Response(null, { status: 404 });
  }

  // CSS fallback
  if (request.headers.get('accept').includes('text/css')) {
    return new Response('', { headers: { 'Content-Type': 'text/css' }});
  }

  // JS fallback
  if (request.headers.get('accept').includes('javascript')) {
    return new Response('', { headers: { 'Content-Type': 'application/javascript' }});
  }

  return new Response(null, { status: 404 });
}

// Background sync handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      handleBackgroundSync()
      .catch(err => {
        console.error('Background sync failed:', err);
        throw err; // Triggers retry
      })
    );
  }
});

async function handleBackgroundSync() {
  // Implement your sync logic here
  
}