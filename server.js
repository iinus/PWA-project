var express = require('express');
var uuidv4 = require('uuid/v4');
var app = express ();
var dict = {};
app.set ('view engine', 'hbs');
var id = uuidv4();
const trackID = id; 

var manifest = {
  "name": "PWA for tracking users",
  "short_name": "Tracking users",
  "description": "PWA that demonstrates user tracking",
  "icons": [
      {
      "src": "../public/images/jslogo.png",
      "type": "image/png",
      "sizes": "512x512"
      },
      {
      "src": "../public/images/jslogo.png",
      "type": "image/png",
      "sizes": "192x192"
      }
  ],
  "start_url": '?id='+ trackID,
  "display": "standalone",
  "background_color": "#f0db4f",
  "theme_color": "#FFC0CB"
};

app.get ('/', (req, res) => {
  var id = req.query.id;
  console.log(dict[id]);
  if(dict[id]){ // hvis brukeren finnes
    dict[id]++;
  }else{
    dict[id]=1
  }
  console.log(dict)
  res.render ('index.hbs', {trackID: trackID, stats: dict[trackID]});
});

app.get('?id=' + trackID, (req, res) => {
  res.redirect ('/');
});

app.get("/manifest.json", (req, res) => {
  res.append("Content-Type", "text/json; charset=utf-8")
  res.send(JSON.stringify(manifest))
})

app.get("/jslogo.png", (req,res) =>{
  res.attachment('/public/images/jslogo.png')
})

app.get("/app.js", (req, res) => {
  res.append("Content-Type", "text/javascript; charset=utf-8")
  res.send(`
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register ('/sw.js')
      .then (registration => console.log ('Service worker registration successful!' + registration.scope));
  }
  `)
})

app.get("/main.js", (req, res) => {
  res.append("Content-Type", "text/javascript; charset=utf-8")
  res.send(`
  Notification.requestPermission(function(status) {
    console.log('Notification permission status:', status);
});

let deferredPrompt;

var btnAdd = document.createElement("button");
btnAdd.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
});

btnAdd.addEventListener('click', (e) => {
    // hide our user interface that shows our A2HS button
    btnAdd.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice
    .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
        } else {
        console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
    });
});

window.addEventListener('appinstalled', (evt) => {
  app.logEvent('a2hs', 'installed');
});
  `)
})

app.get("/sw.js", (req, res) => {
  res.append("Content-Type", "text/javascript; charset=utf-8")
  res.send(`
  var staticCacheName = 'pre-cache';
  self.addEventListener('install', function (event) {
    console.log('ServiceWorker (' + staticCacheName + '): install called');
    event.waitUntil(
      caches.open(staticCacheName).then(function (cache) {
        return cache.addAll([
          '/?id=${trackID}',
          '/',

        ]);
      })
    );
  });
  
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
    console.log(\`[Service Worker] Push had this data: "\${event.data.text()}"\`);
  
    const title = 'Push notification';
    const options = {
      body: 'Yay it works.',
      icon: '/images/jslogo.png',
      badge: '/images/jslogo.png'
    };
  
    event.waitUntil(self.registration.showNotification(title, options));
  });
  `)
})

app.listen(3000, function()
{console.log("server listening")})
