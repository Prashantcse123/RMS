var localStrategy=require('passport-local').Strategy;

var User=require("./models/user")

module.exports=function(passport){
    
        passport.serializeUser(function(user,done){
            done(null,user)
        });
        passport.deserializeUser(function(user,done){
            done(null,user)
        });

        passport.use(new localStrategy(function(username,password,done){
           //console.log(username,password)
              console.log("Local Stratgy called....")
              User.findOne({username:username},function(err,doc){
                  if(err){
                      done(err)
                  }
                  if(doc){
                      var valid=doc.comparePassword(password,doc.password)
                      if(valid){
                          done(null,{uid:doc._id,username:doc.username,name:doc.name,password:doc.password,profilePicPath:doc.profilePicPath})
                      }
                      else{
                          done(null,false)
                      }
                  }
                  else{
                          done(null,false)
                  }
              })
        }))
}