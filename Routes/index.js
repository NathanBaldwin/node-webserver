'use strict'

const express = require('express');
const router = express.Router();

const api = require('./api');
const contact = require('./contacts');
const hello = require('./hello');
const home = require('./home');
const random = require('./random');
const sendphoto = require('./sendphoto');
const cal = require('./cal');


router.use(api);
router.use(contact);
router.use(hello);
router.use(home);
router.use(random);
router.use(sendphoto);

module.exports = router;
