'use strict';

var path = require('path');

const multer = require('multer');
//specifies options for storage and naming of uploaded files:
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp/uploads/')
  },
  filename: function (req, file, cb) {
    //console.log("file from storage params:", file);
    //console.log("req from storage params", req.body.name);
    //console.log("cb:", cb);
    cb(null, Date.now() + path.extname(file.originalname));
  }
})

const express = require('express');
const bodyParser = require('body-parser');
const imgur = require('imgur');
const upload = multer({storage: storage});//requiring and executing multer and specifying destination
const app = express(); //executing/running the server;
const PORT = process.env.PORT || 3000;
const request = require('request'); //module to go to url (like curl)
const _ = require('lodash');
const cheerio = require('cheerio');
//const MongoClient = require('mongodb').MongoClient;//don't need the mongo driver if using mongoose
const mongoose = require('mongoose');
const MONGODB_URL = 'mongodb://localhost:27017/node-webserver';

const News = require('./models/news')
const AllCaps = require('./models/allcaps')
const Contact = require('./models/contact')

let db;


app.set('view engine', 'jade'); //configures node to read jade

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));

app.use(express.static(path.join(__dirname, 'public')));


app.locals.title = 'THE Super Cool App';

//bodyParser is middleware that looks at request, sees if it's a form. If it is, it adds the req.body 
//so we can receive form. Need this to receive form.
app.use(bodyParser.urlencoded({extended: false})); 
app.use(bodyParser.json());

app.get('/', (req, res) => {
  News.findOne().sort('-_id').exec(     //.exec executes query
  // db.collection('news').findOne({}, {sort: {_id: -1}}, 
  (err, doc) => {
    console.log("doc:", doc);

    let headline = doc.top[0].title;
    console.log("headline", headline);

    
    res.render('index', { //by default, render looks for a views directory
      title: 'Super Cool App',
      date: new Date(),
      headline: headline
    });
  })
});

app.get('/api', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')//resets header to allow calls from anywhere, not just our server
  res.send({hello: 'World'});//interprets this as json
})

app.post('/api', (req, res) => {
  // console.log(req.body);
  // const obj = _.mapValues(req.body, val => val.toUpperCase());
  // //res.send(obj);
  // // db.collection('allcaps').insertOne(obj, (err, result) => {
  //   if (err) throw err;

  //   console.log(result);
  //   res.send(result.ops[0]);
  //   const caps = new AllCaps(obj);

  const obj = _.mapValues(req.body, val => val.toUpperCase());
  
  const caps = new AllCaps(obj);

  caps.save((err, _caps) => {
    if (err) throw err;

    res.send(_caps);
  });
});

app.get('/api/news', (req, res) => {
  News.findOne().sort('-_id').exec(

  //db.collection('news').findOne({}, {sort: {_id: -1}},
   (err, doc) => { //sort method grabs last one (reverses order)
    console.log("doc:", doc);
    if (doc) {
      const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
      const diff = new Date() - doc._id.getTimestamp() - FIFTEEN_MINUTES_IN_MS;
      const lessThan15MinutesAgo = diff < 0;

      if (lessThan15MinutesAgo) {
        res.send(doc);
        return;
      }
    }

    const url = 'http://cnn.com';

    request.get(url, (err, response, html) => {
      if (err) throw err;

      const news = [];
      const $ = cheerio.load(html);

      const $bannerText = $('.banner-text');

      news.push({
        title: $bannerText.text(),
        url: url + $bannerText.closest('a').attr('href')
      });

      const $cdHeadline = $('.cd__headline');

      _.range(1, 12).forEach(i => {
        const $headline = $cdHeadline.eq(i);

        news.push({
          title: $headline.text(),
          url: url + $headline.find('a').attr('href')
        });
      });

      const obj = new News({ top: news });

      obj.save((err, newNews) => {
        if (err) throw err;
      // News.insertOne({})
      // //db.collection('news').insertOne({ top: news }, (err, result) => {
      //   // if (err) throw err;
      // obj.save((err, newNews) => {
      // if (err) throw err;

      // res.send(newNews);

        res.send(newNews);
      });
    });
  });
});

      

app.post('/contact', (req, res) => {
  
  const obj = new Contact({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message
  });

  obj.save((err, newObj) => {
    if (err) throw err;

    console.log(newObj);
    res.send(`<h1>Thanks for contacting us ${newObj.name}</h1>`);
  });

  // db.collection('contact').insertOne(obj, (err, result) => {
  //   if (err) throw err;

  //   res.send(`<h1>Thanks for contacting us ${obj.name}</h1>`);
  // });
});

  // db.collection('contacts').insertOne(contactDoc)

  // res.send(`<h1>Thanks for contacting us ${name}</h1>`);
// });

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/sendphoto', (req, res) => {
  res.render('sendphoto');//renders sendphoto jade file

});

app.post('/sendphoto', upload.single('image'), (req, res) => {//image is name attr on form
  console.log("req.body:", req.body);
  console.log("req.file.filename:", req.file.filename);
  let name = req.file.filename;
  console.log("name:", name);
  console.log("req.file.path:", req.file.path);


  
  imgur.uploadFile(req.file.path)
    .then(function (json) {

        let photoLink = {
         photo: json.data.link
        }
        console.log('photo link:', json.data.link);

        db.collection('images').insertOne(photoLink, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send(`<img src=${result.ops[0].photo}>`)
      });

    })
    .catch(function (err) {
        console.error(err.message);
    });
  //res.send('<h1>Thanks for sending us your photo</h1>');
  //now we need to except the form:

})

app.get('/hello', (req, res) => {

    const name = req.query.name || "you";
    const msg = `<h1>Hey Hey There ${name}</h1>`


    console.log(req.params);

    res.writeHead(200, { //telling the browser what it's about to get
      'Content-type': 'text/html'
    });

    msg.split('').forEach((char, i) => {
      setTimeout(() => {
        res.write(char);
      }, 100 * i);
    });
      
    setTimeout(()=> {
      res.end('<h1>Goodbye World!!</h1>');
    }, 5000)
  });

app.get('/random', (req, res) => {
  //const randomNum = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
  //const 
  res.send(Math.random().toString());
});

app.get('/cal', (req, res) => {
  const month = require('../node-cal/lib/makeMonth');
  
  if (!req.query.requestedYear && !req.query.requestedYear) {
    let today = new Date();
    let currentMonth = today.getMonth() + 1;
    let currentYear = today.getYear() + 1900;
    let monthCal = month.arrayToString(parseInt(currentYear), parseInt(currentMonth), 1)
    console.log("monthCal", monthCal);
    res.end(monthCal);
  } else {
    const requestedYear = parseInt(req.query.requestedYear);
    const requestedMonth = parseInt(req.query.requestedMonth);
    console.log("requestedYear", requestedYear);
    console.log("requestedMonth", requestedMonth);
    let monthCal = month.arrayToString(requestedYear, requestedMonth, 1)
    console.log("monthCal", monthCal);
    res.end(monthCal);
  }
});

app.all('*', (req, res) => {
  res.status(403)
  .send('Access Denied'); //send instead of writeHead
  // res.end('Access Denied!'); don't need res.end in express
});

mongoose.connect(MONGODB_URL);

mongoose.connection.on('open', () => {
  console.log('MONGO OPEN');

  // database.collection('docs').insertMany([ 
  //     {a: 'b'}, {c: 'd'}, {e: 'f'}
  //   ], (err, res) => {
  //     if (err) throw err;
  //     console.log("res:", res);
  //   });
  
  // db = database; //let db defined on line 31. Now we can have access to db
  //in other app.commands;

  // console.log("db:", db);
  app.listen(PORT, () => {
    console.log(`Node.js server started. Listening on port ${PORT}`);
  });
})

