const CACHE_NAME = 'realops-cache-v4';

// Core assets to pre-cache on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.min.css',
  './bundle.min.js',
  './assets/logo.png',
  './assets/logo.webp',
  './manifest.json'
];

// Offline fallback HTML
const OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline — RealOps</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #050505; color: #F8FAFC;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 24px; text-align: center;
    }
    .container { max-width: 440px; }
    .icon { font-size: 64px; margin-bottom: 20px; }
    h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    p { font-size: 15px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px; }
    button {
      background: #FF6B35; color: #fff; border: none;
      padding: 12px 28px; font-size: 15px; font-weight: 600;
      border-radius: 8px; cursor: pointer; transition: opacity 0.2s;
    }
    button:hover { opacity: 0.85; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>You're Offline</h1>
    <p>It looks like you've lost your internet connection. RealOps needs an active connection to load convoy data and event schedules.</p>
    <button onclick="window.location.reload()">Try Again</button>
  </div>
</body>
</html>`;

// Install: pre-cache core assets and activate immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache the offline page
      cache.put('/offline', new Response(OFFLINE_PAGE, {
        headers: { 'Content-Type': 'text/html' }
      }));
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

// Listen for cache invalidation messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
  }
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
        .catch(() =>
          caches.match(request)
            .then(cached => cached || caches.match('./index.html'))
            .then(cached => cached || caches.match('/offline'))
        )
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
