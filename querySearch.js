const express = require("express");
const app = express.Router();
var DButils = require('./DButils');

//connects to the db using db module (DButils) and returns query answer
function sqlQuery(query) {
    var promise = new Promise(function (resolve, reject) {
        DButils.db.all(query, [], async (err, rows) => {
            resolve(rows);
        });
    });
    return promise;
}

// searches for exact gene name. if not found searches for synonyms. returns the record found
async function findGene(geneName) {
    var ans = undefined;
    var queryAns = await sqlQuery("SELECT * FROM Genes WHERE gene_symbol = '" + geneName + "'");
    if (queryAns.length != 0) {
        ans = queryAns[0];
    }
    else {
        queryAns = await sqlQuery("SELECT * FROM Genes WHERE synonyms LIKE  '%" + geneName + "%'");

        if (queryAns.length != 0) {

            for (var i = 0; i < queryAns.length; i++) {
                var geneSynonyms = queryAns[i].synonyms.split("; ");
                for (var j = 0; j < geneSynonyms.length; j++) {
                    if (geneSynonyms[j] == geneName) {
                        ans = queryAns[i];
                        break;

                    }

                }
            }

        }

    }
    return ans;
}

// for each transcripts looks for protein, exons, domains
async function findTranscriptInfo(transcript) {
    var exons = await sqlQuery("SELECT * FROM Exons WHERE transcript_id =  '" + transcript.refseq_ID + "'");
    transcript.exons = exons;

    var protein = await sqlQuery("SELECT * FROM Proteins WHERE transcript_id =  '" + transcript.refseq_ID + "'");
    transcript.protein = protein[0];

    var domains = await sqlQuery("SELECT * FROM DomainEvent WHERE protein_id =  '" + transcript.protein_id + "'");
    transcript.protein.domains = domains;

    //info on each domain
    for (var j = 0; j < transcript.protein.domains.length; j++) {
        var domainType = await sqlQuery("SELECT * FROM DomainType WHERE id =  '" + transcript.protein.domains[j].type_id + "'");
        transcript.protein.domains[j].domainType = domainType[0];
    }
    return transcript;
}

//actual server handler. gets request and sends the final answer.
app.get("/querySearch/:inputGene", async (req, res) => {
    var finalAns = {};
    //finding gene
    finalAns.gene = await findGene(req.params.inputGene);
    if (finalAns.gene == undefined) {
        //send error
        res.status(400).send(finalAns);
    }
    else {
        //get transcripts
        var transcripts = await sqlQuery("SELECT * FROM Transcripts WHERE gene_id =  '" + finalAns.gene.GeneID + "'");
        finalAns.transcripts = transcripts;
  
        //foreach transcript: protein, exons, domains
        for (var i = 0; i < finalAns.transcripts.length; i++) {
            finalAns.transcripts[i] = await findTranscriptInfo(finalAns.transcripts[i]);
        }
        //send ans
        res.status(200).send(finalAns);
    }
    console.log("querySearch:");
    console.log(finalAns);
});

module.exports = app;