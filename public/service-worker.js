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
  // Bypass service worker for API requests
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
