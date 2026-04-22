const CACHE_NAME = 'askim-pwa-v11';
const urlsToCache = [
  './',
  './index.html',
  './chat.html',
  './diary.html',
  './bucket-list.html',
  './lists.html',
  './jackpot.html',
  './confessions.html',
  './confession-archive.html',
  './music.html',
  './games.html',
  './dice.html',
  './memory-game.html',
  './mine-game.html',
  './scratch-game.html',
  './special-days.html',
  './envelopes.html',
  './envelope-archive.html',
  './style.css',
  './script.js',
  './icon.svg',
  './resim1.jpg',
  './resim2.jpg',
  './resim3.jpg',
  './resim4.jpg',
  './resim5.jpg',
  './resim6.jpg',
  './resim7.jpg',
  './resim8.jpg',
  './resim9.jpg',
  './resim10.jpg',
  './resim11.jpg',
  './resim12.jpg',
  'https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Outfit:wght@300;400;600&family=Playfair+Display:ital,wght@1,600&family=Shadows+Into+Light&display=swap',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      // İnternet var ve yeni sürüm çekildiyse önbelleğe kaydet
      if (event.request.method === 'GET') {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      }
      return response;
    }).catch(() => {
      // İnternet yoksa veya hata varsa önbellekten getir (URL parametrelerini görmezden gel)
      return caches.match(event.request, { ignoreSearch: true });
    })
  );
});
// Eski önbellekleri temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});
