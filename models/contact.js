'use strict';

const mongoose = require('mongoose');

const Contact = mongoose.model('contacts', mongoose.Schema({
  name: String,
  email: String,
  message: String
}));

module.exports = Contact;
