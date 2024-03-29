const cacheName = 'food_app';

const contentToCache = [
  '/food_app/',
  '/food_app/index.html',
  '/food_app/food.webmanifest',
  '/food_app/favicon.ico',
  '/food_app/icon-512.png',
];

// Installing Service Worker
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching all: app shell and content');
    try {
    await cache.addAll(contentToCache);
    }
    catch (e) {
        console.log(e)
    }
  })());
});

// Fetching content using Service Worker
self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const r = await caches.match(e.request);
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
    if (r) return r;
    const response = await fetch(e.request);
    //const cache = await caches.open(cacheName);
    //console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
    //cache.put(e.request, response.clone());
    return response;
  })());
});
