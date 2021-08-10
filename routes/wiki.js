// wiki.js - Wiki route module.
// 2021-07-16
/*
 * Note: Here we are defining our route handler callbacks directly 
 * in the router functions. In the LocalLibrary we'll define these 
 * callbacks in a separate controller module.
 */

var express = require('express');
var router = express.Router();

// Home page route.
router.get('/', function (req, res) {
  res.send('Wiki home page');
})

// About page route.
router.get('/about', function (req, res) {
  res.send('About this wiki');
})

module.exports = router;

// wiki.js - Wiki route module.

var express = require('express');
var router = express.Router();

// Home page route.
router.get('/', function (req, res) {
  res.send('Wiki home page');
})

// About page route.
/*
 * Note: Router functions are Express middleware, which means that they 
 * must either complete (respond to) the request or call the next function 
 * in the chain. In the case above we complete the request using send(), 
 * so the next argument is not used (and we choose not to specify it).
 *
 * The router function below takes a single callback, but you can specify 
 * as many callback arguments as you want, or an array of callback 
 * functions. Each function is part of the middleware chain, and will be 
 * called in the order it is added to the chain (unless a preceding 
 * function completes the request).
 * 
 * The callback function here calls send() on the response to return the 
 * string "About this wiki" when we receive a GET request with the path 
 * ('/about').
 * 
 * There are a number of other response methods for ending the 
 * request/response cycle. For example, you could call res.json() to 
 * send a JSON response or res.sendFile() to send a file. The 
 * response method that we'll be using most often as we build up the 
 * library is render(), which creates and returns HTML files using 
 * templates and data—we'll talk a lot more about that in a later article!
 */
router.get('/about', function (req, res) {
  res.send('About this wiki');
})

module.exports = router;
