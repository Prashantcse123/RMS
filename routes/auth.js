var express = require('express');
var router = express.Router();
var User=require('../models/user');

//var LocalStratgy=require('passport-stratgy').LocalStratgy;
/* GET home page. */

module.exports=function(passport){

router.post('/signup', function(req, res) {
        console.log("entered here....")
        var body=req.body;
        var name=body.name;
        var email=body.email;
        var uname=body.username;
        var password=body.password;

    User.findOne({username:uname},function(err,doc){
    if(err){
        res.status(500).send("error occured....")
    }
    else if(doc){
        res.status(500).send("User already Exists...")
    }
    else{
        var record = new User();
        record.username=uname;
        record.password=record.hashPassword(password);
        record.email=email;
        record.name=name;

        record.save(function(err,user1){
            if(err){
                res.status(500).send("db error")
            }
            else{
            // res.send(user1);
            res.redirect('/profile')
            }
        })
      }
    })      
      });
router.post('/login',passport.authenticate('local',{
    failureRedirect:"/login?status=Invalid_username_and_Password",
    successRedirect:'/profile'
}),function(req,res){
     console.log("hiiii")
})



    return router;
}



     

   



