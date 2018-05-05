
'use strict';

let fs = require('fs');
let mongoose = require('mongoose');
let express = require('express');
let app = express();
let promise;
let connectionString = 'mongodb://jaknap_9:2tunacan@ds259079.mlab.com:59079/url_hash'; 
let bodyParser = require('body-parser');
let btoa = require('btoa');
let atob = require('atob');

//mongoose.connect('mongodb://jaknap_9:2tunacan@ds259079.mlab.com:59079/url_hash',{useMongoClient: true});

app.use(bodyParser.urlencoded({
    extended: true
}));



app.route('/')
    .get(function(req, res) {
      res.sendFile(process.cwd() + '/views/index.html');
    })



let countersSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    count: { type: Number, default: 0 }
});

let Counter = mongoose.model('Counter', countersSchema);




let urlSchema = new mongoose.Schema({
    _id: {type: Number},
    url: '',
    created_at: ''
});

urlSchema.pre('save', function(next) {
    console.log('running pre-save');
    let doc = this;
    Counter.findByIdAndUpdate({ _id: 'url_count' }, { $inc: { count: 1 } }, function(err, counter) {
        if(err) return next(err);
        console.log(counter);
        console.log(counter.count);
        doc._id = counter.count;
        doc.created_at = new Date();
        console.log(doc);
        next();
    });
});
let URL = mongoose.model('shortUrl', urlSchema);

promise = mongoose.connect(connectionString);
promise.then(function(db) {
    console.log('connected!');
    URL.remove({}, function() {
        console.log('URL collection removed');
    })
    Counter.remove({}, function() {
        console.log('Counter collection removed');
        let counter = new Counter({_id: 'url_count', count: 10000});
        counter.save(function(err) {
            if(err) return console.error(err);
            console.log('counter inserted');
        });
    });
});


app.get('/:hash', function(req, res) {
let baseid = req.params.hash;
if(baseid) {
    let id = atob(baseid);
    console.log('db id' + id);
    URL.findOne({ _id: id }, function(err, doc) {
        if(doc) {
            res.redirect(doc.url);
        } else {
            res.redirect('/');
        }
    });
}
});


app.get('/new*', function(req, res, next) {
    let urlData = (req.path).slice(5);
      //{ "original_url":"http://foo.com:80", "short_url":"https://little-url.herokuapp.com/8170" }
    URL.findOne({url: urlData}, function(err, doc) {
        if(doc) {
            console.log('Found record');
            res.send({
                "original_url": urlData,
                "shortened_url": "https://fluff-channel.glitch.me/" + btoa(doc._id)
            });
        } else {
            console.log('Create new document');
            let url = new URL({
                url: urlData
            });
            url.save(function(err) {
                if(err) {
                    return console.error(err);
                }
                console.log(urlData);
                res.send({
                    "original_url": urlData,
                    "short_url": "https://fluff-channel.glitch.me/" + btoa(url._id)
                });
            });
        }
    });
});


      



app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });



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

