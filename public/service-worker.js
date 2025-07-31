self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('zion-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/qr-scan',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Parse URL for origin and path checks
  const requestURL = new URL(event.request.url);
  // Bypass service worker for cross-origin and API requests
  if (requestURL.origin !== self.location.origin || requestURL.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
