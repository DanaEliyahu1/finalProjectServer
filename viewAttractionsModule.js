const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")

const app = express();
app.use(express.json());
var DButilsAzure = require('./DButils');
var secret = "secret123";

function verify(req, res) {
    const token = req.header("x-auth-token");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (!token) {
        res.status(401).send("Access denied. No token provided.");
        return undefined;
    }
    // verify token
    try {
        const decoded = jwt.verify(token, secret);
        req.decoded = decoded;
        return req.decoded.id; //move on to the actual function
    } catch (exception) {
        res.status(400).send("Invalid token.");
        return undefined;
    }
    return undefined;
}



router.get("/getFavoriteAttractions", async (req, res) => {
    var username = verify(req, res);
    if (username != undefined) {
        res.status(200).send(await sqlQuery("SELECT attractions.attractionName,picture,rank FROM attractions, userAttractions WHERE attractions.attractionName=userAttractions.attractionName"
            + " AND username='" + username + "' ORDER BY rank ASC"));
        console.log("getFavoriteAttractions");
    }

});


router.get("/getLastAttractions", async (req, res) => {
    var username = verify(req, res);
    if (username != undefined) {
        var lastAttractions = await sqlQuery("SELECT attractions.attractionName,picture FROM attractions, userAttractions WHERE attractions.attractionName=userAttractions.attractionName"
            + " AND username='" + username + "'");
        if (lastAttractions.length > 2) {
            var attractionResult = [];
            for (var i = 0; i < 2; i++) {
                attractionResult[i] = lastAttractions[i];
            }
            res.status(200).send(attractionResult);
        }
        else {
            res.status(200).send(lastAttractions);
        }

        console.log("getFavoriteAttractions");
    }

});

router.get("/getCategories", async (req, res) => {
    res.status(200).send(await sqlQuery("SELECT * FROM categories"));
    console.log("getCategories");



});

router.get("/getAttractionsByCategory/:category", async (req, res) => {
    res.status(200).send(await sqlQuery("SELECT attractionName,picture FROM attractions WHERE category='" + req.params.category + "'"));
    console.log("getAtractionByCategory");


});




router.get("/getRandomPopularAttractions", async (req, res) => {

    var goodAttraction = await (sqlQuery("SELECT attractionName,picture FROM attractions WHERE rating >= 4 "));
    console.log(goodAttraction);
    goodAttraction = JSON.parse(JSON.stringify(goodAttraction));
    var size = goodAttraction.length;
    if (size < 4) {
        res.status(200).send(goodAttraction);
    }
    else {
        var attractionResult = [];
        for (var i = 0; i < 3; i++) {
            var random = Math.floor((Math.random() * size));
            var duplicate = false;
            for (var j = 0; j < attractionResult.length; j++) {
                if (goodAttraction[random] === attractionResult[j]) {
                    duplicate = true;
                    break;
                }

            }
            if (duplicate) {
                i--;
            }
            else {
                attractionResult[i] = goodAttraction[random];
            }

        }

        res.status(200).send(attractionResult);
    }


});





router.get("/getAttractionsByName/:attractionName", async (req, res) => {

    res.status(200).send(await sqlQuery("SELECT attractionName,picture FROM attractions WHERE attractionName LIKE'%" + req.params.attractionName + "%'"));
    console.log("getAttractionsByName");


});





router.get("/getMostPopularAttractionForUser", async (req, res) => {
    var username = verify(req, res);
    if (username != undefined) {
        var attractions = (await sqlQuery("SELECT * FROM attractions  WHERE category IN"
            + "(SELECT categoryName FROM userInterests WHERE username='" + username + "')ORDER BY rating DESC;"));
        var popularAttractions = [];
        for (var i = 0; i < Math.min(4, attractions.length); i++) {
            popularAttractions[i] = attractions[i];
        }
        res.status(200).send(popularAttractions);
        console.log("getMostPopularAttractionForUser");
    }

});



router.get("/viewAttraction/:attractionName", async (req, res) => {

    await (sqlQuery("UPDATE attractions SET views= views+1 WHERE attractionName='" + req.params.attractionName + "'"));
    res.status(200).send(await sqlQuery("SELECT * FROM attractions WHERE attractionName='" + req.params.attractionName + "'"));
    console.log("viewAttraction");


});



router.get("/getLastReviews/:attractionName", async (req, res) => {

    var result = await (sqlQuery("SELECT * FROM reviews WHERE attractionName='" + req.params.attractionName + "'ORDER BY date DESC"));
    var reviews = [];
    for (var i = 0; i < Math.min(2, result.length); i++) {
        reviews[i] = result[i];
    }
    res.status(200).send(reviews);
    console.log("getLastReviews");

})




router.get("/getQuestions", async (req, res) => {

    res.status(200).send(await sqlQuery("SELECT * FROM questions"));
    console.log("getQuestions");



});

function sqlQuery(query) {
    return DButilsAzure.execQuery(query)
        .then(function (result) {
            //console.log(result);
            return result;
        })
        .catch(function (err) {
            console.log(err)
            return err;
        })
}
module.exports = router;