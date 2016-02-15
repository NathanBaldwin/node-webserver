'use strict';

const express = require('express');
const router = express.Router();

const request = require('request');
const _ = require('lodash');
const cheerio = require('cheerio');
const News = require('../models/news');
const AllCaps = require('../models/allcaps');

router.get('/api', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')//resets header to allow calls from anywhere, not just our server
  res.send({hello: 'World'});//interprets this as json
})

router.post('/api', (req, res) => {

  const obj = _.mapValues(req.body, val => val.toUpperCase());
  
  const caps = new AllCaps(obj);

  caps.save((err, _caps) => {
    if (err) throw err;

    res.send(_caps);
  });
});

router.get('/api/news', (req, res) => {
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

        res.send(newNews);
      });
    });
  });
});

module.exports = router;
