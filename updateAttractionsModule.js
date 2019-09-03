const express = require("express");
const router=express.Router();
const jwt=require("jsonwebtoken")

const app = express();
app.use(express.json());
var DButilsAzure = require('./DButils');
var secret="secret123";

function verify (req,res){
    const token = req.header("x-auth-token");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // no token
    if (!token){
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
// do not need this ??
/*
router.post("/updateFavoriteAttractions",async (req, res) => {
    var username=verify(req,res);
    if(username != undefined){
        res.status(200).send( await sqlQuery("INSERT INTO userAttractions(username,attractionName) VALUES('"+username+"','"+req.body.attractionName+"')"));
        console.log("updateFavoriteAttractions");
    }
});
*/




router.put("/updateMyAttractionSort/:attractionArray/:rankArray",async (req, res) => {
    var username=verify(req,res);
    if(username != undefined){
        var rankArr= req.params.rankArray.split(',');
        var attractionArr= req.params.attractionArray.split(',');
        await(sqlQuery("DELETE FROM userAttractions WHERE username='"+username+"'"));
        for(var i=0; i<rankArr.length;i++){ 

        await(sqlQuery("INSERT INTO userAttractions (username,rank,attractionName) VALUES('"+username+"','"+rankArr[i]+"','"+attractionArr[i]+"')"));

        }
        res.status(200).send("success");
        console.log("Got GET Request");
    }
    
});


router.post("/addRating", async(req, res) => {
    //reminding the date format is  yyyy-mm-dd
    var username=verify(req,res);
    if(username != undefined){
        var valid= await validRating(req.body);
        if (valid != "success"){
            res.status(400).send(valid);
        }
        else{
              res.status(200).send(await sqlQuery("INSERT INTO reviews (username,rating,review,date,attractionName)"+
        " VALUES('"+username+"',"+req.body.rating+",'"+req.body.review+"','"+req.body.date+"','"+req.body.attractionName+"')"));
        var AveregeScore=await sqlQuery("SELECT AVG(rating) FROM reviews WHERE attractionName='"+req.body.attractionName+"'");
        await(sqlQuery("UPDATE attractions SET rating= "+AveregeScore[0]['']+" WHERE attractionName='"+req.body.attractionName+"'"));
        console.log("addRating");
        }
      
    }
    
});

async function validRating(body){
if(body.rating== undefined || body.review== undefined || body.date==undefined || body.attractionName==undefined ){
    return ("Please enter all fields");

}
if(body.rating<1 || body.rating> 5){
    return ("Please enter rating between 1 -5 ");

}
if(body.date.length != 10){
    return "Please enter date in format YYYY-MM-DD";
}
var attraction= await sqlQuery("SELECT attractionName FROM attractions WHERE attractionName='"+body.attractionName+"'");

if(attraction.length==0){
 return "Choose an existing attraction";   
}
return "success";
}

function sqlQuery(query){
    console.log(query);
    return DButilsAzure.execQuery(query)
    .then(function(result){
            return result;
        })
        .catch(function(err){
            console.log(err)
            return err;
        })
    
}
module.exports=router;