var moment = require("moment");
moment.locale('zh-CN');

// var t = moment().format('MMMM Do YYYY');

// var t = moment("20111031", "YYYYMMDD").fromNow(); // 8 年前

var t = moment.unix(1598781876.721).format("YYYY/MM/DD");
console.log(t);