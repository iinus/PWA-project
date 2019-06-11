var express = require('express');
var uuidv4 = require('uuid/v4');
var app = express ();
var dict = {};
app.set ('view engine', 'hbs');
var id = uuidv4();
var trackID = id; 
app.use(express.static(__dirname + "/public/images"));


var manifest = {
  "name": "PWA for tracking users",
  "short_name": "Tracking users",
  "description": "PWA that demonstrates user tracking",
  "icons": [
      {
      "src": '/jslogo.png',
      "type": "image/png",
      "sizes": "512x512"
      },
      {
      "src": '/jslogo.png',
      "type": "image/png",
      "sizes": "192x192"
      }
  ],
  "start_url": '/?id='+ trackID,
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

app.get('/:?id=' + trackID, (req, res) => {
  res.render ('home.hbs');
});

app.get("/manifest.json", (req, res) => {
  res.append("Content-Type", "text/json; charset=utf-8")
  res.send(JSON.stringify(manifest))
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
  
  `)
})

app.listen(8080, function()
{console.log("server listening")})
