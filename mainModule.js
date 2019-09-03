

const express = require("express");
const app = express();
app.use(express.json());
function sqlQuery(query){

    db.all(query,[],(err,rows)=>{
        return rows;
    })

}



app.get("/querySearch/:inputGene", async (req, res) => {
 
        var geneAns=await sqlQuery("SELECT gene_symbol FROM Genes WHERE gene_symbol = '" + req.params.inputGene + "'" );
        console.log("querySearch");
        res.send("geneAns");

    

});

app.get("/test", async (req, res) => {
    res.send("geneAns");



});