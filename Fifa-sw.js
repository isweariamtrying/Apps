const CACHE_NAME = 'wc-schedule-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install Event - Cache the critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell assets...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches if layout upgrades
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Serve directly from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return the cached file if found, otherwise try fetching over network
      return cachedResponse || fetch(event.request);
    }).catch(() => {
      // Fallback behavior if both fail (truly offline and asset wasn't cached)
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
