const jwt=require("jsonwebtoken")
const express = require("express");
const app = express();
app.use(express.json());
var DButilsAzure = require('./DButils');
const router=express.Router();
var fs = require('fs');

var secret="secret123";




router.post("/login",async (req, res) => {
    res.header("Access-Control-Allow-Origin","*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var userRecord= await sqlQuery("SELECT password FROM users WHERE username='"+req.body.username+"'");
    if(userRecord.length>0){

        if(req.body.password===userRecord[0]['password']){
           
            payload = { id: req.body.username, name: req.body.username, admin: true };
            options = { expiresIn: "1d" };
            const token = jwt.sign(payload, secret, options);
            res.status(200).send(token);
            console.log("Login success");
        }
        else{
            res.status(400).send(("Wrong password"));
            console.log("Wrong password");
        
        }
    }
    else{
        res.status(400).send("wrong username");
            console.log("Wrong username");
    }
      
});

router.post("/forgotPassword",async (req, res) => {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var currentAnswer=(await sqlQuery("SELECT answer1,answer2 , password FROM users WHERE username='"+req.body.username+"'"
    +" AND (question1='"+req.body.qid +"' OR question2='"+req.body.qid +"') "));
    if(currentAnswer.length>0 && (currentAnswer[0]['answer1']===req.body.answer||currentAnswer[0]['answer2']===req.body.answer)){
      res.status(200).send(currentAnswer[0].password);
    }
    else{
      res.status(200).send(("We could not confirm this answer for this user"));
      console.log("Wrong answer");
    }
  });


router.post("/register",async ( req, res) => {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var inputVerified= checkRegisterInput(req.body);
    if(inputVerified!="success"){
        res.status(400).send(inputVerified);
    }
    else{
    var register=await sqlQuery("INSERT INTO users (username,password,firstName, lastName, country,city,email,question1,answer1,question2,answer2)"
    +"VALUES('"+req.body.username+"','"+req.body.password+"','"+req.body.firstName+"','"+ req.body.lastName+"','"+req.body.country+"','"+req.body.city+"','"+req.body.email+"','"+req.body.question1+"','"+req.body.answer1+"','"+req.body.question2+"','"+req.body.answer2+"')");
  
    for(var i=0; i<req.body.interests.length;i++){
        sqlQuery("INSERT INTO userInterests (username,categoryName) VALUES('"+req.body.username+"','"+req.body.interests[i].categoryName+"')");
    }
    res.status(200).send("success");
    console.log("register");
    }

});
function checkRegisterInput(body){
    if(body.username == undefined || body.password == undefined|| body.city == undefined || body.country == undefined
         || body.firstName == undefined || body.lastName == undefined || body.email == undefined || body.question1 == undefined 
         || body.answer1 == undefined  || body.interests == undefined ||body.question2 == undefined 
         || body.answer2 == undefined){
        return "please fill all fields";
    }
    if(body.username.length<3 || body.username.length>8){
        return "keep your username between 3 to 8 characters";
    }
    if(body.password.length<5 || body.password.length>10 ){
        return "keep your password between 5 to 10 characters";
    }
    if((!body.username.match("^\s*([a-zA-Z]+)\s*$")) || (!body.password.match("^\s*([0-9a-zA-Z]+)\s*$"))){
        return "please make sure your username contains only letters \n and password contains only letters and numbers";
    }
    if(body.city.length<2){
        return "please enter a valid city name";
    }
    if(body.country.length<2){
        return "please enter a valid country name";
    } 
    
    if(!body.email.match(/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/)){
        return "please enter a valid email";
    }
    if(body.interests.length<2){
        return "please enter at least two categories";
    }
    /*countries =JSON.parse(parser.toJson("<Countries><Country><ID>1</ID><Name>Australia</Name></Country><Country><ID>2</ID><Name>Bolivia</Name></Country><Country><ID>3</ID><Name>China</Name></Country><Country><ID>4</ID><Name>Denemark</Name></Country><Country><ID>5</ID><Name>Israel</Name></Country><Country><ID>6</ID><Name>Latvia</Name></Country><Country><ID>7</ID><Name>Monaco</Name></Country><Country><ID>8</ID><Name>August</Name></Country><Country><ID>9</ID><Name>Norway</Name></Country><Country><ID>10</ID><Name>Panama</Name></Country><Country><ID>11</ID><Name>Switzerland</Name></Country><Country><ID>12</ID><Name>USA</Name></Country></Countries>", {reversible: true}));
    var found=false;
    for(var i=0; i<countries.Countries.Country.length;i++){
        if(countries.Countries.Country[i]["Name"]["$t"]===body.country){
            found=true;
            break;
        }
    }
    if(!found){
        return "country not found in our databases";
    }*/
    return "success";
}

//module.exports.forgotPassword=forgotPassword;
function sqlQuery(query){
    return DButilsAzure.execQuery(query)
    .then(function(result){
        //console.log(result);
            return result;
        })
        .catch(function(err){
            console.log(err)
            return err;
        })
    
}

module.exports=router;