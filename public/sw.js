var staticCacheName = 'pre-cache';

self.addEventListener('install', function (event) {
  console.log('ServiceWorker (' + staticCacheName + '): install called');
  event.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      return cache.addAll([
        '/',
        '/manifest.json',
        'public/images/icons/jslogo.png'
      ]);
    })
  );
});

//         'lib/jquery.min.js','lib/bootstrap.min.css',         'views/index.hbs','views/manifest.hbs',

self.addEventListener('activate', function (event) {
  console.log('ServiceWorker: Activate');
  //activate active worker asap
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  //handle live reload function (for develop purpose)
  if (event.request.url.indexOf('/browser-sync/') !== -1) {
    //fetch(..) is the new XMLHttpRequest
    event.respondWith(fetch(event.request));
    return;
  }

  console.log('ServiceWorker: fetch called for ' + event.request.url);
  //if request in cache then return it, otherwise fetch it from the network
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = 'Push notification';
  const options = {
    body: 'Yay it works.',
    icon: 'images/jslogo.png',
    badge: 'images/jslogo.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
