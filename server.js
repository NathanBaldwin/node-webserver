'use strict';

var path = require('path');

const app = require('express')();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000; //have to have process.env.PORT for heroku to work - uses random port;

const MONGODB_HOST = process.env.MONGODB_HOST || 'localhost';
const MONGODB_USER = process.env.MONGODB_USER || '';
const MONGODB_PASS = process.env.MONGODB_PASS || '';
const MONGODB_PORT = process.env.MONGODB_PORT || 27017;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'node-webserver';

const MONGODB_AUTH = MONGODB_USER
  ? `${MONGODB_USER}:${MONGODB_PASS}@`
  : '';

const MONGODB_URL = `mongodb://${MONGODB_AUTH}${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB_NAME}`

//kteikslkdjfdsl

const routes = require('./routes/');


app.set('view engine', 'jade'); //configures node to read jade

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));


app.locals.title = 'THE Super Cool App';

//bodyParser is middleware that looks at request, sees if it's a form. If it is, it adds the req.body 
//so we can receive form. Need this to receive form.
app.use(bodyParser.urlencoded({extended: false})); 
app.use(bodyParser.json());

app.use(routes);

mongoose.connect(MONGODB_URL);

mongoose.connection.on('open', () => {
  console.log('MONGO OPEN');

  app.listen(PORT, () => {
    console.log(`Node.js server started. Listening on port ${PORT}`);
  });
})
