var createError = require('http-errors');
require("dotenv").config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morganLogger = require('morgan');
var cors = require('cors');
var apiRouter = require('./routes/api');
const { logger } = require('./helper/logger'); // Import the pre-initialized logger instance

var app = express();

// Initialize the custom logger
logger.initialize().catch(console.error);
logger.info('Application started', {
  version: '1.0.1',
  environment: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  nodeVersion: process.version,
  memoryUsage: process.memoryUsage()
}).catch(console.error);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// ** Custom logging middleware **
// You can keep morgan for development if you want, or remove it
if (process.env.NODE_ENV === 'development') {
  app.use(morganLogger('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: 'http://localhost:5005',
  credentials: true
}));

app.use(function(err, req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5005');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(session({
  secret: "preventive-maintenance-system",
  saveUninitialized: true,
  resave: false,
  name: "preventive-maintenance-system"
}));

app.use(function(req, res, next){
  res.locals.session = req.session;
  next();
});

app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // Log the error
  logger.error('Application error', {
    status: err.status || 500,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

