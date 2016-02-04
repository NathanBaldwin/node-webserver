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
app.set('view engine', 'jade'); //configures node to read jade

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// http.createServer((req, res) => {
//   console.log(req.method, req.url);
//   if (req.url === '/hello') {
//     const msg = '<h1>Hey Hey There World</h1>';

//     res.writeHead(200, { //telling the browser what it's about to get
//       'Content-type': 'text/html'
//     });

//     msg.split('').forEach((char, i) => {
//       setTimeout(() => {
//         res.write(char);
//       }, 1000 * i);
//     });
      
//     setTimeout(()=> {
//       res.end('<h1>Goodbye World!!</h1>');
//     }, 2000)
  
//   } else if (req.url === '/random!') {
//     res.end('<h1>Random</h1>')
//   } else {
//     res.writeHead(403, { //telling the browser what it's about to get
//       'Content-type': 'text/html'
//     })
//     res.end('<h1> Access Denied! </h1>');
//   }
// })
app.locals.title = 'THE Super Cool App';

//bodyParser is middleware that looks at request, sees if it's a form. If it is, it adds the req.body 
//so we can receive form. Need this to receive form.
//app.use(bodyParser.urlencoded({extended: false})); 

app.get('/', (req, res) => {
    
    res.render('index', { //by default, render looks for a views directory
      title: 'Super Cool App',
      date: new Date()

  });
});

app.post('/contact', (req, res) => {
  //debugger
  console.log("saved file as:", req.body.name);
  const name = req.body.name; //key of name come from name attr in jade doc.
  
  res.send(`<h1>Thanks for contacting us ${name}</h1>`);
});

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
        console.log('photo link:', json.data.link);
    })
    .catch(function (err) {
        console.error(err.message);
    });
  res.send('<h1>Thanks for sending us your photo</h1>');
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

app.listen(PORT, () =>   {
  console.log(`Node.js server started. Listening on port ${PORT}`);
});
