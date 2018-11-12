var mongoose=require("mongoose")
//let auto_inc=require('mongoose-auto-increment')
let Rest=require('../models/restaurent')
//auto_inc.initialize(mongoose.connection)
var dealSchema=mongoose.Schema;

var deal=new dealSchema({
   dealCode:String,
   dealDescription:String,
   dealDiscount:Number,
   dealRestaurentId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'restaurent'}
})
let DealModel=mongoose.model("deal",deal)
module.exports=DealModel;

//deal.plugin(auto_inc.plugin,"dealID")
