var express = require('express');
var uuidv4 = require('uuid/v4');
var fs = require('fs');
var hbs = require('hbs');
var app = express ();
var dict = {};
app.set ('view engine', 'hbs');
app.use (express.static(__dirname + '/public'));

var id = uuidv4();
var trackID = '?id=' + id; 

var obj = {
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
  "start_url": trackID,
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
        var json = JSON.stringify(obj); 
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
  res.render('index.hbs', {trackID: req.params.trackID});
})

app.get ('/manifest.json', (req, res) => {
  var matches = /\/([a-z]+)\/?$/i.exec (req.headers.referer);
  if (matches && matches.length > 1) {
    var trackID = matches[1];
  } else {
    var id = uuidv4();
    var trackID = '?id=' + id; //Default
  }
  // Need to set content type, default is text/html
  res.set ('Content-Type', 'application/json');
  res.render ('manifest.hbs', {trackID});
  //setTimeout(1000);
  //res.redirect('/');
});

app.get ('/:trackID', (req, res) => {
  res.render ('index.hbs');
});

app.listen(3000, function()
{console.log("server listening")})