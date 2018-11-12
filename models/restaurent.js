

const mongoose=require('mongoose')
let AutoIncrement = require('mongoose-sequence')(mongoose);
let deal=require("./deal")
var restSchema=mongoose.Schema;
var commentSchema = mongoose.Schema({
        commentText:String,
        userID:{type:mongoose.Schema.Types.ObjectId,ref:'users'}
    },{ _id : false });
var restaurent=new restSchema({
    
    restName:String,
    restAddress:String,
    restLocation:{
            type: { type: String },
            coordinates:{ type: [Number],required: true},
    },
    restType:String,
    restPhone:Number,
    restOwner:String,
    likeCount:Number,
    likes:[{type:mongoose.Schema.Types.ObjectId,ref:'users'}],
    disLikeCount:Number,
    dislikes:[{type:mongoose.Schema.Types.ObjectId,ref:'users'}],
    commentCount:Number,
    comment:[commentSchema],
    deals:[{type:mongoose.Schema.Types.ObjectId,required:true,ref:'deal'}],
    restImage:String
})
restaurent.index({restLocation: '2dsphere'});
/*
db.places.find( { loc: { $geoWithin: { $centerSphere: [ [ -74, 40.74 ] ,
    100 / 3963.2 ] } } } )
    */
var RestaurentModel=mongoose.model('Restaurent',restaurent)
module.exports=RestaurentModel;
restaurent.plugin(AutoIncrement,{inc_field:'id'})

module.exports.checkLike=function(rID,uID){
    RestaurentModel.find({$and:[{id:rID},{likes:uID}]},function(err,doc){
        if(err){
            console.log(err)
        }
        if(doc.length>0){
               RestaurentModel.update({id:rID},{$pull:{likes:uID},"$inc": { "likeCount": -1 }},function(err,doc){
                   try{
                       if(err){
                           console.log(err)
                       }
                   }
                   catch(err){
                   }
               })
        }
    })
    }
    
    module.exports.checkdisLike=function(rID,uID){
        RestaurentModel.find({$and:[{id:rID},{dislikes:uID}]},function(err,doc){
            if(err){
                console.log(err)
            }
            if(doc.length>0){
                   RestaurentModel.update({id:rID},{$pull:{dislikes:uID},"$inc": { "disLikeCount": -1 }},function(err,doc){
                           if(err){
                               console.log(err)
                           }
                           console.log(doc)
                   })
            }
        })
        }
        
