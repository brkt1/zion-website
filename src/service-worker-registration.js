if ('serviceWorker' in navigator) {
  const swVersion = 'v3'; // Update this when making changes
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js', { scope: './', type: 'module' })
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        // Check for updates every hour
        setInterval(() => {
          registration.update().then(() => {
            console.log('Service Worker update check completed');
          });
        }, 60 * 60 * 1000);
      })
      .catch(err => {
        console.error('ServiceWorker registration failed: ', err);
      });
  });

  // Clear old service workers
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      if (cacheName !== swVersion) {
        caches.delete(cacheName);
      }
    });
  });
}
