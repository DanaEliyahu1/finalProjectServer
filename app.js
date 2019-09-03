

const express = require("express");
const app = express();
var cors=require("cors");
const mainModule= require("./mainModule");
const port = process.env.PORT || 3000; //environment variable
var DButils = require('./DButils');


var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
//app.use(express.json());
app.use(cors());
app.use(express.json(),function(req, res, next) {
	express.json();
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});



//server side fronend
//app.use(express.static('D:\\documents\\users\\danaeliy\\Downloads\\ASS_3.3-master/ASS_3.3-master'))
/*
app.get("/test", async (req, res) => {
    res.send("geneAns");
});

*/

function sqlQuery(query){

   return DButils.db.all(query,[],(err,rows)=>{
        return rows;
    })

}




app.get("/querySearch/:inputGene",(req, res) => {
    const p= new Promise ((resolve,reject)=>{
        resolve (sqlQuery("SELECT gene_symbol FROM Genes WHERE gene_symbol = '" + req.params.inputGene + "'" ));
    })
 
    
    p.then(function success(result){
        var geneAns=result;
   
    console.log("querySearch");
    res.send(JSON.stringify (geneAns));
 })


});



app.listen(port, () => {
    console.log(`Listening on port ${port}`);

});
