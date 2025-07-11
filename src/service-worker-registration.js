if ('serviceWorker' in navigator) {
  const swVersion = 'v3'; // Update this when making changes
  window.addEventListener('load', async function() {
    // Unregister old service workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }

    // Clear caches
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      if (cacheName !== swVersion) {
        await caches.delete(cacheName);
      }
    }

    // Register new service worker
    navigator.serviceWorker.register('/service-worker.js', { scope: './', type: 'module' })
      .then(registration => {
        
        
        // Check for updates every hour
        setInterval(() => {
          registration.update().then(() => {
            
          });
        }, 60 * 60 * 1000);
      })
      .catch(err => {
        console.error('ServiceWorker registration failed: ', err);
      });
  });
}
