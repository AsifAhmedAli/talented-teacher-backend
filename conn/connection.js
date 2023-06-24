const mysql = require("mysql");
require("dotenv").config();
// const connection = () => {
var con = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.pass,
  database: process.env.dbname,
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
// };

module.exports = con;
