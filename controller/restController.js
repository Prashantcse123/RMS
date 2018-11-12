var express = require('express');
var router = express.Router();
var restModel = require('../models/restaurent')
var middleware = require('../middleware/authMiddleware')
var ObjectId = require('mongoose').Types.ObjectId;
var path="";
var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/restaurent')
    },
    filename: (req, file, cb) => {
      path=file.fieldname + '-' + Date.now();
      cb(null, path)
    }
});
var upload = multer({storage: storage});

router.post('/showRestaurentNearMyPlace', (req, res) => {

    let lat = req.body.lat;
    let lng = req.body.lng;
    restModel.find(
        {
            restLocation:
            {
                $geoWithin: { $centerSphere: [[lat, lng], 1 / 3963.2] }
            }
        }
        , (err, doc) => {
            if (err) {
                console.log(err)
                res.send(err)
            } else {
                console.log(doc)
            }
            res.render('showRestaurent', { data: doc, lat: lat, lng: lng, place: req.body.searchinput })
        })
})

router.get('/restentry', middleware, function (req, res) {
    res.render('addRestaurent')
})

router.get('/show', middleware, function (req, res) {

    res.render('show')
})
router.post('/show', middleware, function (req, res) {

    res.render('show')
})

router.get('/like/:id', middleware, function (req, res) {
    var param = req.params.id;
    var userID = new ObjectId(req.user.uid);
    //console.log(req.user)
    console.log(userID);
    console.log(param);
    restModel.checkdisLike(param, userID)
    restModel.find({ $and: [{ id: param }, { likes: userID }] }, function (err, doc) {
        if (err) {
            console.log(err)
        }
        if (doc.length == 0) {
            restModel.findOneAndUpdate({ id: param }, {
                "$inc": { "likeCount": 1 },
                "$addToSet": { "likes": userID }
            }, function (err, doc) {
                if (err) {
                    res.write(err)
                    res.end();
                }
                res.redirect('/controller/showrecords')
            })
        } else {
            console.log(doc)
            res.redirect('/controller/showrecords')
        }
    })
})

router.get('/displayRestaurent/:id', (req, res, next) => {
    let userID = req.params.id;
    restModel.findOne({ id: userID })
        .populate('likes', 'name email profilePicPath')
        .populate('dislikes', 'name email profilePicPath')
        .populate('comment.userID', 'name email profilePicPath')
        .exec(function (err, doc) {
            res.render('displayRestaurent', { data: doc })
        })
})

router.post('/uploadImage/:id',upload.single('image'), (req, res) => {
    let userID = req.params.id;
    restModel.findOneAndUpdate({ id: userID }, { $set: { restImage: "/restaurent/" + path } }, function (err, doc) {
        if (err) {
            return res.end("Operation not done...");
        }
        console.log(path)
        var path1 = '/controller/displayRestaurent/' + userID;
        res.redirect(path1)
    })

})

router.get('/unlike/:id', middleware, function (req, res) {
    var param = req.params.id;
    var userID = new ObjectId(req.user.uid)
    //console.log(req.user)
    console.log(userID);
    console.log(param);
    restModel.checkLike(param, userID)
    restModel.find({ $and: [{ id: param }, { dislikes: userID }] }, function (err, doc) {
        if (err) {
            console.log(err)
        }
        if (doc.length == 0) {
            restModel.findOneAndUpdate({ id: param }, {
                "$inc": { "disLikeCount": 1 },
                "$addToSet": { "dislikes": userID }
            }, function (err, doc) {
                if (err) {
                    res.write(err)
                    res.end();
                }
                res.redirect('/controller/showrecords')
            })
        } else {
            console.log(doc)
            res.redirect('/controller/showrecords')
        }
    })
})
router.get('/comment/:id', middleware, function (req, res) {
    var param = req.params.id;
    res.render('comment', { current: '/controller/storeComment/', param1: param })
})
router.post('/storeComment/:id', middleware, function (req, res) {
    var param = req.params.id;
    var userID = req.user.uid;
    var cText = req.body.comment;
    restModel.update({ id: param }, { $push: { comment: { "commentText": cText, "userID": new ObjectId(userID) } } }, function (err, doc) {
        if (err) {
            console.log(err)
        }
        console.log(doc)
        res.send("Inserted...")
        //res.redirect('/controller/showrecords')
    })
})
router.post('/restentry', middleware, function (req, res) {
    var restName = req.body.restName;
    var restAddress = req.body.restAddress;
    var restType = req.body.restType;
    var restPhone = req.body.restPhone;
    var restOwner = req.body.restOwner;
    var lat = req.body.lat;
    var lng = req.body.lng;
    var restLoc = { type: 'Point', coordinates: [lat, lng] };

    var restObject = new restModel({
        restName: restName,
        restAddress: restAddress,
        restLocation: restLoc,
        restType: restType,
        restPhone: restPhone,
        restOwner: restOwner
    })

    restObject.save(function (err, rest) {
        if (err) {
            console.log(err)
        }
        console.log("Restaurent Successfully Added....")
    });
    res.redirect('/profile')
})

router.get('/showrecords', middleware, function (req, res) {
    let count = "";
    restModel.count((err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            count = data;
        }
    })

    restModel.find(function (err, data) {
        if (err) {
            console.log(err)
        }
        console.log(data)
        res.render('showRestaurent', { data: data, totalRestaurent: count })
    })
})

router.get('/showrecords/:page', middleware, async function (req, res) {
    let page = parseInt(req.params.page, 10);
    if (page == 0) {
        res.send("----Requested Page Not Available----");
        res.end();
        return;
    }
    let page_size = 3;
    let nextPage = 0;
    let prevPage = 0;
    let skips = page_size * (page - 1)
    console.log("Page No:", page)
    let count = "";
    let totalPages = 0;
    await getCount()
        .then((result) => {
            count = result;
            totalPages = parseInt((parseInt(count, 10) + page_size - 1) / page_size);
            if (page > totalPages) {
                res.send("----Requested Page Not Available----");
                res.end();
                return;
            }
            if (totalPages == 0 || totalPages == 1) {
                nextPage = prevPage = totalPages;
            }
            else if (page < totalPages) {
                nextPage = page + 1;
                prevPage = page;
            }
            else {
                nextPage = totalPages;
                prevPage = totalPages - 1;
            }

            restModel.find()
                .limit(page_size)
                .skip(skips)
                .exec(function (err, data) {
                    if (err) {
                        console.log(err)
                    }
                    console.log(data)
                    res.render('showRestaurent', { data: data, totalRestaurent: count, next: nextPage, prev: prevPage })
                })
        })
        .catch((err) => {
            console.log(err)
        })


})




router.get('/delete/:id', middleware, function (req, res) {
    var param = req.params.id;
    console.log(param)
    restModel.deleteOne({ id: param }, function (err, data) {
        if (err) {
            console.log(err)
        }
        console.log("Data Deleted successfully....")


        res.redirect('/controller/showrecords')
    })
})

router.post('/update/:index/:id', middleware, function (req, res) {
    var param = req.params.id;
    var index = req.params.index;
    console.log(param)
    var restName = req.body.restName[index];
    var restAddress = req.body.restAddress[index];
    var restType = req.body.restType[index];
    var restPhone = req.body.restPhone[index];
    var restOwner = req.body.restOwner[index];

    var updateObject = new restModel({
        id: param,
        restName: restName,
        restAddress: restAddress,
        restType: restType,
        restPhone: restPhone,
        restOwner: restOwner
    })


    restModel.findOneAndUpdate({ id: param }, { $set: { restName: restName, restAddress: restAddress, restType: restType, restPhone: restPhone, restOwner: restOwner } }, function (err, data) {
        if (err) { console.log(err) }
        console.log("successfully updated")
    })

    res.redirect('/controller/showrecords')
})



function getCount() {
    return new Promise((resolve, reject) => {
        restModel.count((err, data) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            else {
                resolve(data)
            }
        })
    })
}

module.exports = router;

