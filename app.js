var createError = require('http-errors');
var express = require('express');
// A core Node library for parsing file and directory paths
path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 2021-07-16
// var wiki = require('../routes/wiki.js');

// These modules/files contain code for handling particular 
// sets of related "routes" (URL paths).
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');  // Import routes for "catalog" area of site.
// 2021-08-07 16:35 Adding this code as instructed on
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/deployment
/*
 * Note
 * For a high-traffic website in production you wouldn't use this 
 * middleware. Instead, you would use a reverse proxy like nginx.
 *
 * 2021-08-08 12:15 Adding 'helmet' support (require and use).
 * See https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/deployment
 * 
 * Helmet is a middleware package. It can set appropriate HTTP headers 
 * that help protect your app from well-known web vulnerabilities 
 * (see the docs for more information on what headers it sets and 
 * vulnerabilities it protects against).
 * 
 * Note
 *
 * The command above adds a subset of the available headers (these make 
 * sense for most sites). You can add/disable specific headers as needed 
 * by following the instructions for using helmet here:
 * https://www.npmjs.com/package/helmet
 * 
 */
var compression = require('compression');
var helmet = require('helmet');

// Create the Express application object
var app = express();

app.use(helmet());
// Create the Express application object.
var app = express();

app.use(compression()); // Compress all routes.

app.use(express.static(path.join(__dirname, 'public')));

var app = express();

// 2021-07-14
//Set up mongoose connection
var mongoose = require('mongoose');
// var mongoDB = 'insert_your_database_url_here';
// I put the "connection string" here. Is that the same thing as the
// "database URL"? I think so.
//
// This code creates the default connection to the database and binds 
// to the error event (so that errors will be printed to the console).
var mongoDB = 'mongodb+srv://User_Larry:rhinoluv2%21atl%3B@cluster0.8kldv.mongodb.net/local_library?retryWrites=true&w=majority'
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// The next set of functions call app.use() to add the 
// middleware libraries into the request handling chain.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// In addition to the 3rd party libraries we imported previously, 
// we use the express.static middleware to get Express to serve 
// all the static files in the /public directory in the project root.
app.use(express.static(path.join(__dirname, 'public')));

// The imported code will define particular routes for the 
// different parts of the site.
// The paths specified above ('/' and '/users') are treated as a 
// prefix to routes defined in the imported files. So for example, 
// if the imported users module defines a route for /profile, you 
// would access that route at /users/profile. We'll talk more about 
// routes in a later article.
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);  // Add catalog routes to middleware chain.

// Note: We have added our catalog module at a path '/catalog'. 
// This is prepended to all of the paths defined in the catalog module. 
// So for example, to access a list of books, the URL will be:
// /catalog/books/.

// The last middleware in the file adds handler methods for errors 
// and HTTP 404 responses.

// Catch 404 and forward to error handler.
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

// 2021-07-16
// var wiki = require('../routes/wiki.js');
// ...
// app.use('/wiki', wiki);
// The two routes defined in our wiki route module are then 
// accessible from /wiki/ and /wiki/about/.

// The Express application object (app) is now fully configured. 
// The last step is to add it to the module exports (this is what 
// allows it to be imported by /bin/www).
module.exports = app;
