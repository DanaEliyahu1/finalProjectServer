

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
    var promise= new Promise(function(resolve,reject){
       DButils.db.all(query,[], async(err,rows)=>{
            resolve(rows);
        });
    });
    return promise;
}




app.get("/querySearch/:inputGene",(req, res) => {
    var geneAns=undefined;
    sqlQuery("SELECT gene_symbol FROM Genes WHERE gene_symbol = '" + req.params.inputGene + "'").then(function(result){
        geneAns=result;
        res.send(JSON.stringify (geneAns));
        //if gene exists create info JSON
        
        //if gene does not exist 
                //try in the synonyms (need splits by '; ')
                //if exist create info JSON
                //else error not found
        console.log("querySearch");
    });
});



app.listen(port, () => {
    console.log(`Listening on port ${port}`);

});
