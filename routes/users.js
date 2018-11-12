var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var mongoose = require('mongoose');
var multer = require('multer');
var middleware = require("../middleware/authMiddleware")
var User = require('../models/user')
var fs=require('fs')
let path = "";
var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {
    path = file.fieldname + req.user.username + file.originalname;
    callback(null, file.fieldname + req.user.username + file.originalname);
  }
});

/* GET users listing. */

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
router.get('/uploadpic', middleware, (req, res) => {
  res.render('uploadProfilePic')
})
router.post('/uploadpic', middleware, (req, res) => {
  var upload = multer({
    storage: Storage
  }).array("profilePic", 2); //Field name and max count

  upload(req, res, function (err) {
    if (err) {
      console.log(err)
      return res.end("Something went wrong!");
    }
    User.findOneAndUpdate({ username: req.user.username },{ $set:{ profilePicPath: "/uploads/" + path }}, (err, doc) => {
      if (err) {
        return res.end("Operation not done...");
      }
      var delFile= "./public"+req.user.profilePicPath;
      if(!(delFile==="./public/uploads/default.png"))
      {
        fs.unlink(delFile,(err)=>{
          if(err){
            console.log(err)
          }
          else{
            console.log("File: "+delFile+" Deleted")
          }
        })
      }
      req.user.profilePicPath="/uploads/"+path;
      return res.redirect('/profile')
    })
    
  });
})
module.exports = router;
