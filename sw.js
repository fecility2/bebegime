importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE_NAME = 'askim-pwa-v16';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './app-bootstrap.js',
  './onesignal-helper.js',
  './time-tracker.js',
  './presence.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './chat.html',
  './diary.html',
  './bucket-list.html',
  './lists.html',
  './confessions.html',
  './music.html',
  './games.html',
  './special-days.html',
  './envelopes.html',
  './profile.html',
  './notification-center.html'
];

const isCacheableRequest = (request) => {
  const url = new URL(request.url);
  return request.method === 'GET' && ['http:', 'https:'].includes(url.protocol);
};

const isSameOrigin = (request) => new URL(request.url).origin === self.location.origin;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!isCacheableRequest(request)) return;

  const url = new URL(request.url);
  if (url.hostname.includes('onesignal.com')) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, fresh.clone());
        return fresh;
      } catch (error) {
        return (await caches.match(request, { ignoreSearch: true }))
          || (await caches.match('./index.html'));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreSearch: true });
    const network = fetch(request).then(async (response) => {
      if (response && response.ok && isSameOrigin(request)) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => cached);

    return cached || network;
  })());
});
