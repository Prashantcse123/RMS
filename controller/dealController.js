var express=require("express")
var router=express.Router()
var Deal=require('../models/deal')
var rest=require("../models/restaurent")
var ObjectId = require('mongoose').Types.ObjectId; 
router.get('/addDeal/:restId',function(req,res,next){
    res.render('addDeals',{restId:req.params.restId})
})
router.get('/showDeal/:restId',function(req,res,next){
  
  let restId=req.params.restId;
  rest.findOne({_id:new ObjectId(restId)})
  .populate('deals')
  .exec(function(err,doc){
      if(err){
          res.send(err)
          return(err)
      }
      res.render('showDeal',{"RestaurentName":doc.restName,"deals":doc.deals});
  })
})
router.post('/insertDeal',function(req,res,next){
    var dealCode=req.body.dealCode;
    var dealDescription=req.body.dealDescription;
    var dealDiscount=req.body.dealDiscount;
    var dealRid=new ObjectId(req.body.dealRestaurentId);
    var deal =new Deal({
       dealCode:dealCode,
       dealDescription:dealDescription,
       dealDiscount:dealDiscount,
       dealRestaurentId:dealRid
    })

    deal.save(function(err,doc){
        if(err){
            res.status(500).send("Database Error")
        }
        else
        {
            console.log(dealRid)
            console.log(doc._id)
            rest.findOneAndUpdate({_id:dealRid},{ $addToSet:{deals:doc._id}},(err,doc)=>{
                  if (err){
                      console.log("Error:",err)
                      res.send("can not push deal into restaurent")
                      return;
                  }
                  else{
                    res.redirect('/controller/showrecords')
                  }
            })
            
        }
    })
})

module.exports=router;