var express = require('express');
var router = express.Router();
var db= require("../database/db")
/* GET home page. */
router.get('/', function(req, res, next) {
  //搭建存储对象
  var data={title:''};
  if(req.session.u){
    data.u = req.session.u;
  }
  var sql_mom= "select * from category order  by id desc";
  db.query(sql_mom,function(error,mm){
    if(!error){
      //创建data的对象mom，并给它里面赋值mm
      data.mom=mm;
      // res.render('traval',{data:data});
    }
    var sql_user ="select * from movies ";
    db.query(sql_user,function(error,use){
      if(!error){
        //创建data的对象user，并给它里面赋值use
        data.articles=use;
        res.render('index',{data:data});//易错：{data:use} 在traval页面可以去掉user
        console.log(data)
        //{data:data} 在traval页面要加.user
      }
    })
  });
});

router.get('/traval', function(req, res, next) {
  //搭建存储对象
  var data={};


  res.render('traval',{data:data});//易错：{data:use} 在traval页面可以去掉user
  console.log(data)
  //{data:data} 在traval页面要加.user
});

router.get('/booklist', function(req, res, next) {
  //搭建存储对象
  var data={title:''};
  if(req.session.u){
    data.u = req.session.u;
  }

  var sql_mom= "select * from category order  by id desc";
  db.query(sql_mom,function(error,mm){
    if(!error){
      //创建data的对象mom，并给它里面赋值mm
      data.mom=mm;
      // res.render('traval',{data:data});
    }
    var sql_user ="select * from articles where istop=1";
    db.query(sql_user,function(error,use){
      if(!error){
        //创建data的对象user，并给它里面赋值use
        data.articles=use;
        res.render('booklist',{data:data});//易错：{data:use} 在traval页面可以去掉user
        console.log(data)
        //{data:data} 在traval页面要加.user
      }
    })
  });


});

module.exports = router;
