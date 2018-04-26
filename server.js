
'use strict';

var fs = require('fs');
var mongoose = require('mongoose');
var express = require('express');
var app = express();


mongoose.connect('mongodb://jaknap_9:xxxxx@ds259079.mlab.com:59079/url_hash',{useMongoClient: true});

let countersSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    count: { type: Number, default: 0 }
});


if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });

/*
app.route('/')
    .get(function(req, res) {
      res.sendFile(process.cwd() + '/views/index.html');
    })
*/

app.route('/new*')
    .get(function(req, res) {
      //console.log();
      let returnVal = (req.path).slice(5);
      //{ "original_url":"http://foo.com:80", "short_url":"https://little-url.herokuapp.com/8170" }
      let jsonBody = {"original_url": returnVal};
      res.send(jsonBody);
    })


// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

