var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');

var indexRouter = require('./routes/index');
var charactersRouter = require('./routes/characters');
var aboutMeRouter = require('./routes/about/me');
var aboutSiteRouter = require('./routes/about/site');

const { title } = require('process');

const allCharactersData = require('./data/characters.json')

var app = express();

// view engine setup
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next)=>{
  res.locals.charactersList = allCharactersData
  res.locals.selected = "none"
  next();
})

app.use('/', indexRouter);
app.use('/characters', charactersRouter);
app.use('/about/me', aboutMeRouter);
app.use('/about/site', aboutSiteRouter);

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
  res.render('error', {title: "Erro!"});
});

module.exports = app;
