var express = require('express');
var router = express.Router();

let loggedIn=function(req,res,next){
 if(req.isAuthenticated()){
    next();
 }
 else{
   res.redirect("/login")
 }
}

let alreadylogged=function(req,res,next){
  if(req.isAuthenticated()){
    // res.render('profile',{username:req.user.username})
    res.redirect('/profile')
  }
  else{
    next()
  }
 }


/* GET home page. */
router.get('/', alreadylogged,function(req, res, next) {
  res.render('login', { title: 'Login Page' });
});
router.get('/login',alreadylogged,function(req, res, next) {
res.render('login')

})
router.get('/signup', function(req, res, next) {
  res.render('signup')
}) 

router.get('/profile',loggedIn,function(req,res){
  //res.send(req.session)
  res.render('profile',{username: req.user.username,name:req.user.name,profilePicPath:req.user.profilePicPath})
})

router.get('/logout',function(req,res){
  req.logout();
  res.redirect('/login')
})

router.get('/restentry',loggedIn, function(req,res){

   res.render('addRestaurent')

})

module.exports = router;
