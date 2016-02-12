'use strict';

const mongoose = require('mongoose');

const News = mongoose.model('news', mongoose.Schema ({
  top: [
    {
      title: String,
      url: String
    }
    ]
}))

module.exports = News
