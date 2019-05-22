var express = require('express');
var uuidv4 = require('uuid/v4');
var fs = require('fs');
var hbs = require('hbs');
var app = express ();
var dict = {};
app.set ('view engine', 'hbs');
app.use (express.static(__dirname + '/public/app.js'));

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
  fs.exists('public/manifest.json', function(exists){
    if(exists){
        console.log("file exists");
        fs.readFile('public/manifest.json', err => {
          if (err) {
              console.log('Error writing file', err)
          } else {
              console.log('Successfully wrote file')
          }});  
        } 
        else {
        var json = JSON.stringify(manifest); 
        fs.writeFile('public/manifest.json', json, 'utf8', err => {
          if (err) {
              console.log('Error writing file', err)
          } else {
              console.log('Successfully wrote file')
          }
        });
    } 
    });

  var id = req.query.id;
  if(dict[id]){ // hvis brukeren finnes
    dict[id]++;
  }else{
    dict[id]=1
  }

  console.log(dict)
  res.render('index.hbs', {trackID: trackID});
})

app.get (':?id=' + trackID, (req, res) => {
  res.render ('index.hbs', {trackID: trackID});
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
  
  //':/?id=' + '{{trackID}}'
  //console.log("trackid" + {{trackID}});
  
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
      icon: 'images/jslogo.png',
      badge: 'images/jslogo.png'
    };
  
    event.waitUntil(self.registration.showNotification(title, options));
  });
  `)
})

app.listen(3000, function()
{console.log("server listening")})
