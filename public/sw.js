// Bump this version string on every deploy that changes cached assets.
// Bumping it forces every installed client to fetch a fresh cache and
// discard the old one automatically (no reinstall needed).
const CACHE_NAME = 'manual-lysis-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './manual.pdf',
  './udp.pdf',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];

self.addEventListener('install', (event) => {
  // Don't wait for old tabs to close - activate the new SW immediately.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Delete every cache that isn't the current version.
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        )
      ),
      // Take control of any already-open tabs right away.
      self.clients.claim()
    ])
  );
});

// Network First strategy: always try the network for the freshest copy,
// only fall back to cache when offline.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then((response) => {
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, responseClone);
      });
      return response;
    }).catch(() => caches.match(event.request))
  );
});
