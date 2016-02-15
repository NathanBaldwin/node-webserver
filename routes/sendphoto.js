'use strict'

const express = require('express');
const router = express.Router();

const sendphoto = require('../controllers/sendphoto');

const multer = require('multer');
//specifies options for storage and naming of uploaded files:
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp/uploads/')
  },
  filename: function (req, file, cb) {
    //console.log("file from storage params:", file);
    //console.log("req from storage params", req.body.name);
    //console.log("cb:", cb);
    cb(null, Date.now() + path.extname(file.originalname));
  }
})

const upload = require('multer')({ dest: 'tmp/uploads' });

router.get('/sendphoto', sendphoto.index);

router.post('/sendphoto', upload.single('image'), (req, res) => {//image is name attr on form
  console.log("req.body:", req.body);
  console.log("req.file.filename:", req.file.filename);
  let name = req.file.filename;
  console.log("name:", name);
  console.log("req.file.path:", req.file.path);
  
  imgur.uploadFile(req.file.path)
    .then(function (json) {

        let photoLink = {
         photo: json.data.link
        }
        console.log('photo link:', json.data.link);

        db.collection('images').insertOne(photoLink, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send(`<img src=${result.ops[0].photo}>`)
      });

    })
    .catch(function (err) {
        console.error(err.message);
    });
  //res.send('<h1>Thanks for sending us your photo</h1>');
  //now we need to except the form:

})

module.exports = router;
