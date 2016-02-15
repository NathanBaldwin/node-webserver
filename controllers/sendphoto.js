'use strict';

module.exports = {
  index: (req, res) => {
    res.render('sendphoto');
  },

  new: (req, res) => {
    res.send('<h1>Thanks for sending us your photo</h1>');
  }
};
