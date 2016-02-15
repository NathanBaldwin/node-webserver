'use strict'

const express = require('express');
const router = express.Router();

const News = require('../models/news');

router.get('/', (req, res) => {
  News.findOne().sort('-_id').exec(     //.exec executes query
  // db.collection('news').findOne({}, {sort: {_id: -1}}, 
  (err, doc) => {
    console.log("doc:", doc);

     doc = doc || {top: [{title: ''}]};

    let headline = doc.top[0].title;
    console.log("headline", headline);

    
    res.render('index', { //by default, render looks for a views directory
      title: 'Super Cool router',
      date: new Date(),
      headline: headline
    });
  })
});

module.exports = router;
