const CACHE_NAME = 'realops-cache-v3';

// Core assets to pre-cache on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.min.css',
  './bundle.min.js',
  './assets/logo.png'
];

// Install: pre-cache core assets and activate immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('SW pre-cache warning:', err);
      });
    })
  );
});

// Activate: purge old cache versions & take immediate control
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch handler: Network-first for navigation/HTML, Stale-while-revalidate for assets
self.addEventListener('fetch', event => {
  const { request } = event;

  // Only handle GET requests and valid http/https schemes (ignore chrome-extension://, etc.)
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Network-First for HTML / Page Navigation requests so updates are always seen
  if (request.mode === 'navigate' || (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // Stale-While-Revalidate for other assets (CSS, JS, images, fonts)
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
