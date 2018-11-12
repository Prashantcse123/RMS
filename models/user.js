var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var restaurentModel=require('./restaurent')
var schema=mongoose.Schema;
//User Schema
var UserSchema=new schema({
username:{
    type:String,
    index:true,
    required:true
},
password:{
type:String,
required:true
},
email:{
    type:String,
    required:true
},
name:{
type:String,
required:true
},
profilePicPath:{type:String,default:'/uploads/default.png'}
});

UserSchema.post('remove',function(next){
restaurentModel.update({_id:this._id},{$pull:{likes:uID},"$inc": { "likeCount": -1 }});
    next();
})

UserSchema.methods.hashPassword=function(password){
return bcrypt.hashSync(password,bcrypt.genSaltSync(10));
}

UserSchema.methods.comparePassword=function(password,hash){
return bcrypt.compareSync(password,hash);
}

module.exports=mongoose.model('users',UserSchema,'users');

/*module.exports.createUser=function(newUser,callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password=hash;
            newUser.save(callback);
        });
    });
}
*/