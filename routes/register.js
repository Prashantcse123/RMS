var express = require('express');
var router = express.Router();
var User=require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('signup');
});


router.post('/',function(req,res){

  var name=req.body.name;
  var email=req.body.email;
  var username=req.body.username;
  var password=req.body.password;
  var password=req.body.confirm;

  var newUser=new User({
    name:name,
    email:email,
    username:username,
    password:password
  })
   
  User.createUser(newUser,function(err,user){
     if(err){
       console.log(err)
     }
     console.log("Successfully Registered....")
  });
  res.render('index',{title:"Initiate Login..."});

});


module.exports = router
