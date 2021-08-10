/*
 * The route defines a callback that will be invoked whenever an 
 * HTTP GET request with the correct pattern is detected. The matching 
 * pattern is the route specified when the module is imported ('/users') 
 * plus whatever is defined in this file ('/'). In other words, this 
 * route will be used when a URL of /users/ is received.
 */

var express = require('express');
var router = express.Router();

/* GET users listing. */
// If localhost:3000/users/ is input
// 'respond with a resource' is displayed.
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// See the comments in app.js above
// these lines:
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
router.get('/cool/', function (req, res, next) {
  res.send('You\'re so cool.');
});

// Imported into app.js with this line:
// var usersRouter = require('./routes/users');
module.exports = router;
