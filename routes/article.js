"use strict";
var express = require('express');
var router = express.Router();
var db= require("../database/db");
var multer = require("multer");
var path = require("path");
var fs = require("fs");
var moment = require("moment");
//绝对路径，创建在public中uploads文件夹   ./当前目录，跳进子目录    ../跳出上一个目录
var upload = multer({ dest: './public/uploads/' });
// /* GET home page. */
var msg = {
    type:'success',
    message:'操作成功'
};
//影评的详情页和浏览次数
router.get('/movie_show/:fid', function(req, res, next) {
    //获取url中的：id   /5 相当于 req.params.id=5
    var fid = req.params.fid;
    var data={};
    var sql = "select * from category where category_id="+fid;
    db.query(sql,function(error,category) {

        if (!error) {
            data.category = category;
        }

    })
    var fid = req.params.fid;
    var sql ="select * from movies where category_id="+fid;
    db.query(sql,function(error,results){

        if(!error) {
            db.query("update movies set views=views+1 where category_id =" + fid, function (error, articles) {
                if (!error&articles.affectedRows > 0) {
                    console.log("更新成功2");
                }

            })
            data.articles = results[0];
            res.render("user/movie_show", {data: data})

        }
    })


});
//相册的页面
router.get('/photos',function(req,res) {
    var data={};
    if(req.session.u){
        data.u = req.session.u;
    }
    res.render("user/photo",{data:data})
})

//评论区页面
router.get('/vote',function(req,res){
    var data={};
    if(req.session.u){
        data.u = req.session.u;
    }
    var sql="select*from comments";
    db.query(sql,function(err,result){
        if(!err){
            data.articles=result;
        }
    })
    var data={};
    data.page=!req.query.page ||parseInt(req.query.page)<1?1:parseInt(req.query.page);
    var pagesize=5;
    var sql="select count(*) as total from comments ";
    db.query(sql,function(error,result){
        data.count=Math.ceil(result[0].total/pagesize);
        data.page=data.page>=data.count?data.count:data.page;
        var fenye=" limit "+(data.page-1)*pagesize+","+pagesize;
        var sql = "select * from comments"+fenye;

        db.query(sql,function(error,articles) {
            if (!error&articles.length>0) {
                articles.map(function (item) {
                    item.create_at = moment(item.create_at).format('MM/DD,h:mm:ss');
                    item.update_at = moment(item.update_at).format('MM/DD,h:mm:ss');

                })
                data.articles = articles;
                res.render("user/vote", {data: data});
            }

        })
    })

});
//我的评论
router.get('/myvote',function(req,res) {
    var data = {};
    if (req.session.u) {
        data.u = req.session.u;
    }
    var sql = "select*from comments order by id desc";
    db.query(sql, function (err, result) {
        if (!err) {
            result.map(function (item) {
                item.create_at = moment(item.create_at).format('MM/DD,h:mm:ss');
                item.update_at = moment(item.update_at).format('MM/DD,h:mm:ss');
            })
            data.articles= result[0];
        }
        res.render("user/myvote", {data: data});
    })
})
//删除评论
router.get('/dropvote/:id', function(req, res, next) {
    var ssid=req.params.id;
    var sql="delete from comments where id="+ssid;
    db.query(sql,function(error,del){
        if(!error&&del.affectedRows>0){
            res.redirect("/user/vote");
        }else{
            res.redirect("back");
        }
    })
})
//显示浏览次数
router.get('/show/:id', function(req, res, next) {
    var data={title:''};
    if(req.session.u){
        data.u = req.session.u;
    }else{
        res.redirect("/users/login")
    }
    var sql="select * from user where id ="+req.session.u.id;
    db.query(sql,function(err,result){
        if(!err&result.length>0){
            data.art=result[0];
        }else{
            res.redirect("/users/login")
        }
    })
    //获取url中的：id   /5 相当于 req.params.id=5
 var sid = req.params.id;
 var sql ="select * from articles where id="+sid;
 db.query(sql,function(error,results){
     if(!error){
         db.query("update articles set views=views+1 where id ="+sid,function(error,articles){
             if(articles.affectedRows>0){
                 console.log("更新成功");
             }
         })
         data.articles=results;
         res.render("user/show",{data:data})

     }
 })
});
//搜索
router.get('/search', function(req, res, next) {
    var data = {};
    var kid = req.query.keywords;

    var sql='select * from articles where title like "%'+kid+'%" or authors like "%'+kid+'%"';
    db.query(sql,function(error,user){
        if(!error){
        data.articles=user;
        res.render("user/searches",{data:data});
        }
    })
    });
//添加内容
router.get('/add', function(req, res, next) {
    var data={title:''};
    if(req.session.u){
        data.u = req.session.u;
    }else{
        res.redirect("/users/login")
    }

    var sql="select * from user where id ="+req.session.u.id;
    db.query(sql,function(err,result){
        if(!err&result.length>0){
            data.art=result[0];

        }
        var sql="select * from comments";
        db.query(sql,function(err,result){
            if(!err&result.length>0){
                result.map(function (item) {
                    item.create_at = moment(item.create_at).format('MM/DD,h:mm:ss a');
                    item.update_at = moment(item.update_at).format('MM/DD,h:mm:ss a');

                })
                data.articles=result;
            }
            res.render("user/add",{data:data});
        })
    })


})
//储存数据
router.post('/store',upload.single("pic"), function(req, res, next) {
    var cid = req.body.id;
    var title = req.body.username;
    var content = req.body.content;
    var extname=path.extname(req.file.originalname);

    var newname=req.file.filename+extname;
    var oldpath='./public/uploads/'+req.file.filename;
    var newpath=oldpath+extname;
    var create_at = new Date().getTime();
    var update_at = new Date().getTime();
    var bc=[title,content,newname,create_at,update_at];

    var sql="insert into comments(username,content,pic,create_at,update_at) values(?,?,?,?,?)";

    fs.rename(oldpath,newpath,function(error,results){

        if(!error){
            console.log("插入成功");
        }
    })
    db.query(sql,bc,function(error,category){

        if(!error){
            res.redirect("/user/vote");
        }else{
            res.redirect("back");
        }
    })

})
//删除数据
router.get('/drop/:id', function(req, res, next) {
    var ssid=req.params.id;
    var sql="delete from articles where id="+ssid;
    db.query(sql,function(error,del){
        if(!error&&del.affectedRows>0){
        res.redirect("back");
        }else{
            res.redirect("back");
        }
    })

})
//修改数据
router.get('/edit/:id', function(req, res, next) {
    var data={};
    var sid = req.params.id;
    data.msg = msg;
    var cid = parseInt(req.params.id);

    var sql = "select * from category order by id";
    db.query(sql, function (error, category) {
        if (!error) {
            data.category = category;
        }
        var sql = "select * from articles where id=" + cid;

        db.query(sql, function (err, articles) {
            if (!err) {
                data.article = articles[0];
                res.render("user/edit", {data: data});
            }
        })
    })
})
router.post('/update',upload.single("pic"), function(req, res, next) {
    let id = req.body.id;
    let title = req.body.title;
    let content = req.body.content;
    let category_id = req.body.category_id;
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

    var sql="update articles set title=?,content=?,category_id=?,pic=? where id=?";
     var params=[title,content,category_id,newname,id];
     db.query(sql,params,function(error,result){

         if(!error&&result.affectedRows>0){
         msg={
             type:'success',
             message:'操作成功'
         }
         res.redirect("/user/category/"+category_id);
         }else{
             msg={
                 type:'fail',
                 message:'操作失败'
             }
             res.redirect("back");
         }
     })
})

//编辑器
router.post('/upload',upload.single("editormd-image-file"), function(req, res, next) {

    var extname=path.extname(req.file.originalname);

    var newname=req.file.filename+extname;
    var oldpath='./public/uploads/'+req.file.filename;
    var newpath=oldpath+extname;


    fs.rename(oldpath,newpath,function(error,results){
        if(!error) {
            if (error) {
                res.json({
                    success: 0,
                    message: '上传失败',
                    url: ''
                })
            } else {
                res.json({
                    success: 1,
                    message: '上传成功',
                    url: '/uploads/' + newname
                })
            }
        }
    })


})

module.exports = router;
