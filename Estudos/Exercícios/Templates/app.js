var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  req.requestTime = new Date().toLocaleString()
  console.log(`Requisição em ${req.url}, ${req.requestTime}`)
  next()
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require("./routes/index")
var aboutRouter = require("./routes/about")
var dataRouter = require("./routes/data")
var signinRouter = require("./routes/users/signin")
var signinUserIdRouter = require("./routes/users/signin_userid")
var signupRouter = require("./routes/users/signup")
var usersRouter = require("./routes/users/users")

app.use("/", indexRouter)
app.use("/about", aboutRouter)
app.use("/data", dataRouter)
app.use("/users/signin", signinRouter)
app.use("/users/signin", signinUserIdRouter)
app.use("/users/signup", signupRouter)
app.use("/users", usersRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

//Observação: O middleware de erro deve ser definido após todas as rotas e outros middlewares.

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
