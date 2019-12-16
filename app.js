var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//加载路由
var session=require('express-session');
var article = require('./routes/article');
var index = require('./routes/index');
var users = require('./routes/users');
var traval = require('./routes/traval');
var app = express();

// 模板设置
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 7*24*60*60000 }}))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//设置静态资源跟目录
app.use(express.static(path.join(__dirname, 'public')));

//使用路由
app.use('/', index);
app.use('/users', users);
app.use('/traval', traval);
app.use('/user', article);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
