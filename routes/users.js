var express = require('express');
var router = express.Router();
var db= require("../database/db");
var multer = require("multer");
var path = require("path");
var fs = require("fs");
var jiami=require("../plugin/jiami");
var moment = require("moment");
var uploads = multer({ dest: './public/uploads/' });
var msg = {
  type:'success',
  message:'操作成功'
};
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/show', function(req, res, next) {
  res.render('/users/user',{username:'jack'});
});

router.get('/user', function(req, res, next) {
  res.render('users/user');
});
router.get('/js', function(req, res, next) {
  res.render('users/js');
});
router.get('/vote', function(req, res, next) {
  res.render('user/vote');
});
//用户登录界面
router.get('/login1', function(req, res, next) {
  var data={};
  if(req.session.u){
    data.u = req.session.u;
  }
  res.render('users/login1',{data:data});

});
//用户账户和密码验证
router.post('/login2', function(req, res, next) {
//获取登录页面body的name的值；
  var username=req.body.username;
  var userpwd=req.body.userpwd;

  var sql="select * from user where username='"+username+"' and userpwd='"+jiami.md5(userpwd)+"'";
  db.query(sql,function (error,results) {
    if(!error&&results.length>0){
      //需要与
      req.session.u=results[0];
      req.session.u.userpwd=null;
      res.redirect("/users/addmovc");
    }else{
        res.redirect("back");
    }
  })
});
//用户登录界面
router.get('/login', function(req, res, next) {
  var data={};
  if(req.session.u){
    data.u = req.session.u;
  }
  res.render('users/login',{data:data});

});
//用户账户和密码验证
router.post('/login', function(req, res, next) {
//获取登录页面body的name的值；
  var username=req.body.username;
  var userpwd=req.body.userpwd;

  var sql="select * from user where username=+'"+username+"'and userpwd='"+jiami.md5(userpwd)+"'";

  db.query(sql,function (error,results) {

    if(!error&&results.length>0){
      //需要与
      req.session.u=results[0];
      req.session.u.userpwd=null;
      res.redirect("/");
    }else{
        res.redirect("back");
    }
  })
});
//储存旅行分享表单
router.post('/vacation',uploads.single("pic"), function(req, res, next) {
  var title = req.body.title;
  var content = req.body.content;
  var extname=path.extname(req.file.originalname);
  var newname=req.file.filename+extname;
  var oldpath='./public/uploads/'+req.file.filename;
  var newpath=oldpath+extname;
  var create_at = new Date().getTime();
  var update_at = new Date().getTime();
  var bc=[title,content,newname,create_at,update_at];

  var sql="insert into vacation(title,content,pic,create_at,update_at) values(?,?,?,?,?)";

  fs.rename(oldpath,newpath,function(error,results){

    if(!error){
      console.log("旅游图插入成功");
    }
  })
  db.query(sql,bc,function(error,category){
    if(!error){
      res.redirect("/users/allvaca");
    }else{
      res.redirect("back");
    }
  })
})
//全部旅游分享页面
router.get('/allvaca',function(req,res){
  var data={};
  if(req.session.u){
    data.u = req.session.u;
  }
  var sql="select*from vacation";
  db.query(sql,function(err,result){
    if(!err){
      data.articles=result;
    }
  })
  var data={};
  data.page=!req.query.page ||parseInt(req.query.page)<1?1:parseInt(req.query.page);
  var pagesize=5;
  var sql="select count(*) as total from vacation ";
  db.query(sql,function(error,result){
    data.count=Math.ceil(result[0].total/pagesize);
    data.page=data.page>=data.count?data.count:data.page;
    var fenye=" limit "+(data.page-1)*pagesize+","+pagesize;
    var sql = "select * from vacation"+fenye;

    db.query(sql,function(error,articles) {
      if (!error&articles.length>0) {
        articles.map(function (item) {
          item.create_at = moment(item.create_at).format('MM/DD,h:mm:ss');
          item.update_at = moment(item.update_at).format('MM/DD,h:mm:ss');

        })
        data.articles = articles;
        res.render("user/allvacation", {data: data});
      }

    })
  })

});
//添加影评
router.get('/addmovc', function(req, res, next) {
  var data={title:''};
  if(req.session.user){
    data.user = req.session.user;
  }
  var sql="select * from movies_others";

  db.query(sql,function(err,result){
    if(!err&result.length>0){
      result.map(function (item) {
        item.create_at = moment(item.create_at).format('MM/DD,h:mm:ss');
        item.update_at = moment(item.update_at).format('MM/DD,h:mm:ss');

      })
      data.articles=result;

    }
    res.render("user/addmovcom",{data:data});
  })

})
//储存影评
router.post('/storemov',uploads.single("pic"), function(req, res, next) {
  var name = req.body.username;
  var content = req.body.content;

  var extname=path.extname(req.file.originalname);

  var newname=req.file.filename+extname;
  var oldpath='./public/uploads/'+req.file.filename;
  var newpath=oldpath+extname;
  var create_at = new Date().getTime();
  var update_at = new Date().getTime();
  var bc=[name,content,newname,create_at,update_at];

  var sql="insert into movies_others(name,content,pic,create_at,update_at) values(?,?,?,?,?)";

  fs.rename(oldpath,newpath,function(error,results){

    if(!error){
      console.log("影片图插入成功");
    }
  })
  db.query(sql,bc,function(error,category){
    if(!error){
      res.redirect("/users/mymc");
    }else{
      res.redirect("back");
    }
  })
})
//点赞数
router.get('/sum',function(req,res,next){
    var data={}
    var title=req.query.title;
    var likes=req.query.likes;
    console.log(likes)
    var sql="update  user set likes=? where username=?";
    var params=[likes,title]

    db.query(sql,params,function(error,results){

        if(!error){
            var sql="select likes from user where username="+'"'+title+'"';

            db.query(sql,function(err,result){
              console.log(result)
              if(!err){
                data.likes=result[0].likes;

              }
              res.send(data.likes)
            })

        }
    })

})
//影评区页面
router.get('/allmoco',function(req,res){
  var data={};
  if(req.session.u){
    data.u = req.session.u;
  }
  var sql="select*from movies_others";
  db.query(sql,function(err,result){
    if(!err){
      data.articles=result;
    }
  })
  var data={};
  data.page=!req.query.page ||parseInt(req.query.page)<1?1:parseInt(req.query.page);
  var pagesize=5;
  var sql="select count(*) as total from movies_others ";
  db.query(sql,function(error,result){
    data.count=Math.ceil(result[0].total/pagesize);
    data.page=data.page>=data.count?data.count:data.page;
    var fenye=" limit "+(data.page-1)*pagesize+","+pagesize;
    var sql = "select * from movies_others"+fenye;

    db.query(sql,function(error,articles) {
      if (!error&articles.length>0) {
        articles.map(function (item) {
          item.create_at = moment(item.create_at).format('MM/DD,h:mm:ss');
          item.update_at = moment(item.update_at).format('MM/DD,h:mm:ss');

        })
        data.articles = articles;
        res.render("user/allmovcom", {data: data});
      }

    })
  })

});
//我的影评页面
router.get('/mymc', function(req, res, next) {
  var data={title:''};
  if(req.session.user){
    data.user = req.session.user;
  }
  var sql="select * from movies_others order by create_at desc";

  db.query(sql,function(err,result){
    if(!err&result.length>0){
      result.map(function (item) {
        item.create_at = moment(item.create_at).format('MM/DD,h:mm:ss');
        item.update_at = moment(item.update_at).format('MM/DD,h:mm:ss');

      })
      data.articles=result;
    }
    res.render("user/mymovcom",{data:data});
  })
})
//删除影评
router.get('/dropmc/:id', function(req, res, next) {
  var ssid=req.params.id;
  var sql="delete from movies_others where id="+ssid;
  db.query(sql,function(error,del){
    if(!error&&del.affectedRows>0){
      res.redirect("/users/allmoco");
    }else{
      res.redirect("back");
    }
  })
})
//修改影评
router.get('/editmc/:id', function(req, res, next) {
  var data={};
  var sid = req.params.id;
  data.msg = msg;
  var cid = parseInt(req.params.id);
    var sql = "select * from movies_others where id=" + cid;
    db.query(sql, function (err, articles) {
      if (!err) {
        data.articles = articles[0];
        res.render("user/editmc", {data: data});
      }
    })
  })
//储存修改的影评
router.post('/updatemov',uploads.single("pic"), function(req, res, next) {
  let id = req.body.id;
  let name = req.body.name;
  let content = req.body.content;
  //获取图片

  var extname=path.extname(req.file.originalname);
  var newname=req.file.filename+extname;
  var oldpath='./public/uploads/'+req.file.filename;
  var newpath=oldpath+extname;
  if(!newname){
    newname='default.jpg';
  }
  fs.rename(oldpath,newpath,function(error,results){
    if(!error){
      console.log("插入成功");
    }
  })
  var sql="update movies_others set name=?,content=?,pic=? where id=?";
  var params=[name,content,newname,id];
  db.query(sql,params,function(error,result){
    if(!error){
      res.redirect("/users/mymc");
    }else{
      res.redirect("back");
    }
  })
})
//用户退出页面
router.get('/loginout', function(req, res, next) {
  req.session.destroy(function(error){

    if(!error){
      res.redirect('/');
    }
  })

});
//用户注册页面
router.get('/register', function(req, res, next) {
 var data={};

  if(req.session.u){
    data.u = req.session.u;
  }
 if(req.session.error){
   data.error=req.session.error;
   }
  res.render("users/register",{data:data});

});
router.post('/register',uploads.single("pic"), function(req, res, next) {

  var username=req.body.username;
  var userpwd=req.body.userpwd;
  var reuserpwd=req.body.reuserpwd;
  var address=req.body.address;
  var job=req.body.job;
  var email=req.body.email;
  if(userpwd!=reuserpwd){
    req.session.error={
      message:"两次密码不一致"
    }
    res.redirect("back");
  }

  //获得图片
  var extname=path.extname(req.file.originalname);

  var newname=req.file.filename+extname;
  var oldpath="./public/uploads/"+req.file.filename;
  var newpath=oldpath+extname;

  fs.rename(oldpath,newpath,function (error,results) {
    if(!error){
      console.log("插入成功")
    }
  })
  var param =[username,jiami.md5(userpwd),job,address,email,newname];
  var sql="insert into user(username,userpwd,job,address,email,pic) values(?,?,?,?,?,?)";
  db.query(sql,param,function(error,re){
    if(!error && re.insertId>0) {

      req.session.u = {
        id: re.insertId,
        username: username,
        email: email,
        job:job,
        address:address,
        pic:newname
      }
      res.redirect("/");
    }else{
      res.redirect("back");
    }

  })
});
//用户个人中心
router.get('/formlist', function(req, res, next) {
  var data={};
  if(req.session.u){
    data.u = req.session.u;
  }
  var sql = "select * from user where id="+req.session.u.id;

  db.query(sql,function(error,results){
    if(!error){
      data.user = results[0];
      req.session.user = results[0];
      //req.session.user.userpwd = null;
    }
    res.render("users/formlist.html",{data:data});
  });
});
//其他用户信息的查看
router.get('/formshow/:id', function(req, res, next) {
var data={}
    var username=req.params.id;
    var sql = "select * from user where username='"+username+"'";
    console.log(sql)
    db.query(sql,function(error,results){
        if(!error){
          console.log(results)
            data.user = results;
            req.session.user = results;
            //req.session.user.userpwd = null;
        }
        res.render("users/formlistshow.html",{data:data});
    });
});
//用户信息修改
router.post('/formlist',checked,uploads.single('pic'), function(req, res, next) {
if(req.file){
  var extname = path.extname(req.file.originalname);

  //存到数据库
  var newname = req.file.filename+extname;
  if(!newname){
    newname='default.jpg';
  }
  // 原来路径和名称oldpath  './public/uploads/39e20fdfa2400d433d04aad63f95e786'
  var oldpath = './public/uploads/'+req.file.filename;

  //改名后路径和名称
  var newpath = oldpath+extname;

  fs.rename(oldpath,newpath,(err)=>{
    if(!err) console.log("信息修改成功");
  })

}else{
  var newname=req.session.user.pic;
}
var address=req.body.address;
var job=req.body.job;
var email=req.body.email;
var sql="select * from user where email=+'"+email+"' and  job=+'"+job+"' and address=+'"+address+"'";
db.query(sql,function(error,result){
  if(!error&result.length>0 && result[0].id !=req.session.user.id){
    req.session.message = {type:"warning",msg:"此信息已经存在，请重新输入新信息"}
    res.redirect("back");
    return;
  }else{
    var sql="update user set email=?,job=?,address=?,pic=? where id="+req.session.user.id;
    params=[email,job,address,newname];
    db.query(sql,params,function(error,result){
      if(!error){
        req.session.user.job=job;
        req.session.user.address=address;
        req.session.user.email=email;
        req.session.user.pic=newname;
        res.redirect("/");
      }else{
        res.redirect("back");
      }
    })

  }
})
})

function checked(req, res, next){
   if(!req.session.user){
     res.redirect("/users/login");
   }else{
     next();
   }

}
module.exports = router;
