'use strict'

const express = require('express');
const router = express.Router();

router.get('/cal', (req, res) => {
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

module.exports = router;
