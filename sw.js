const CACHE_NAME = 'kaskkn-v1';
const urlsToCache = [
  './',
  './index.html',
  './script.js',
  './img/logo.png'
];

// Install Service Worker dan simpan file ke Cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch data (Gunakan cache jika tidak ada internet)
self.addEventListener('fetch', event => {
  // Biarkan request ke API (Google Script) tetap berjalan online
  if (event.request.url.includes('script.google.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Kembalikan dari cache
        }
        return fetch(event.request); // Ambil dari internet
      })
  );
});