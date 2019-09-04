

const express = require("express");
const app = express();
var cors = require("cors");
const mainModule = require("./mainModule");
const port = process.env.PORT || 3000; //environment variable
var DButils = require('./DButils');


var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
//app.use(express.json());
app.use(cors());
app.use(express.json(), function (req, res, next) {
    express.json();
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


function sqlQuery(query) {
    var promise = new Promise(function (resolve, reject) {
        DButils.db.all(query, [], async (err, rows) => {
            resolve(rows);
        });
    });
    return promise;
}




app.get("/querySearch/:inputGene", async (req, res) => {

    var geneAns =await sqlQuery("SELECT gene_symbol FROM Genes WHERE gene_symbol = '" + req.params.inputGene + "'");
    if (geneAns.length != 0) {
        console.log(geneAns);
        res.send(geneAns);
        console.log("querySearch1");
        return;
    }
    else {
        geneAns = await sqlQuery("SELECT * FROM Genes WHERE synonyms LIKE  '%" + req.params.inputGene + "%'");

        if (geneAns.length != 0) {

            for (var i = 0; i < geneAns.length; i++) {
                var geneSynonyms = geneAns[i].synonyms.split("; ");
                for (var j = 0; j < geneSynonyms.length; j++) {
                    if (geneSynonyms[j] == req.params.inputGene) {
                        res.send(JSON.stringify(geneAns[i]));
                        console.log("querySearch2");
                        return;
                    }

                }
            }

        }
        console.log("querySearch3");
        res.send(undefined);
    }
    });



app.listen(port, () => {
    console.log(`Listening on port ${port}`);

});
