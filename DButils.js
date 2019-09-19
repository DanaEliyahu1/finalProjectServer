const sqlite3 = require('sqlite3').verbose();
 
// open the database
const path = require('path')
const dbPath = path.resolve(__dirname, 'DB_M_musculus.sqlite')
const db = new sqlite3.Database(dbPath)

//code for closing if needed
/*db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');


}); */
exports.db = db;