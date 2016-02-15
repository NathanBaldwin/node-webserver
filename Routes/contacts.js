'use strict'

const express = require('express');
const router = express.Router();

const contactModel = require('../models/contact');
const contactCtrl = require('../controllers/contact');

router.post('/contact', contactCtrl.new);

router.get('/contact', contactCtrl.index);


module.exports = router;
