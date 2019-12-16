var mysql = require ("mysql")

var db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'2020nibuhao',
    port:'3306',
    database:'family'
})
db.connect();
module.exports=db;