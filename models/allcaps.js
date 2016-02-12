'use strict';

const mongoose = require('mongoose');

const AllCaps = mongoose.model('allcaps', 
  mongoose.Schema({}, {strict: false}));

module.exports = AllCaps;
