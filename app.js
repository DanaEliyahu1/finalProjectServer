

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
    var finalAns = {};
    var geneAns = await sqlQuery("SELECT * FROM Genes WHERE gene_symbol = '" + req.params.inputGene + "'");
    if (geneAns.length != 0) {
        finalAns.gene = geneAns[0];
        console.log(geneAns);

    }
    else {
        geneAns = await sqlQuery("SELECT * FROM Genes WHERE synonyms LIKE  '%" + req.params.inputGene + "%'");

        if (geneAns.length != 0) {

            for (var i = 0; i < geneAns.length; i++) {
                var geneSynonyms = geneAns[i].synonyms.split("; ");
                for (var j = 0; j < geneSynonyms.length; j++) {
                    if (geneSynonyms[j] == req.params.inputGene) {
                        finalAns.gene = geneAns[i];
                        break;

                    }

                }
            }

        }

    }
    var transcripts = await sqlQuery("SELECT * FROM Transcripts WHERE gene_id =  '" + finalAns.gene.GeneID + "'");
    finalAns.transcripts=transcripts;
   
        for(var i=0; i<finalAns.transcripts.length;i++){
            var exons = await sqlQuery("SELECT * FROM Exons WHERE transcript_id =  '" + transcripts[i].refseq_ID + "'");
            var proteins = await sqlQuery("SELECT * FROM Proteins WHERE transcript_id =  '" + transcripts[i].refseq_ID + "'");
            var domains= await sqlQuery("SELECT * FROM DomainEvent WHERE protein_id =  '" + transcripts[i].protein_id + "'");
            finalAns.transcripts[i].exons=exons;
            finalAns.transcripts[i].proteins=proteins[0];
            finalAns.transcripts[i].proteins.domains=domains;
            for (var j=0;j<finalAns.transcripts[i].proteins.domains.length;j++){
                var domainType = await sqlQuery("SELECT * FROM DomainType WHERE id =  '" + finalAns.transcripts[i].proteins.domains[j].type_id + "'");
                console.log(domainType);
                finalAns.transcripts[i].proteins.domains[j].domainType=domainType[0];
            }
        }



    console.log("querySearch3");
    res.send(finalAns); 
    console.log(finalAns);
});



app.listen(port, () => {
    console.log(`Listening on port ${port}`);

});
