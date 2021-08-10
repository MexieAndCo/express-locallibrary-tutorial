var express = require('express');
var router = express.Router();

/* GET home page. */
// Added 2021-07-16 (from the downloaded repo)

// Note: This is our first use of the redirect() response method. 
// This redirects to the specified page, by default sending HTTP 
// status code "302 Found". You can change the status code returned 
// if needed, and supply either absolute or relative paths.
router.get('/', function (req, res) {
  res.redirect('/catalog');
});

/*
Removed on 2021-07-16:
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/

module.exports = router;

/* If localhost:3000/blah is input, this is the displayed result:
Not Found
404

NotFoundError: Not Found
    at C:\Users\Larry\Learning\Node\MDN\Node_and_Express\express-locallibrary-tutorial\app.js:45:8
    at Layer.handle [as handle_request] (C:\Users\Larry\Learning\Node\MDN\Node_and_Express\express-locallibrary-tutorial\node_modules\express\lib\router\layer.js:95:5)
    at trim_prefix (C:\Users\Larry\Learning\Node\MDN\Node_and_Express\express-locallibrary-tutorial\node_modules\express\lib\router\index.js:317:13)
    at C:\Users\Larry\Learning\Node\MDN\Node_and_Express\express-locallibrary-tutorial\node_modules\express\lib\router\index.js:284:7
    at Function.process_params (C:\Users\Larry\Learning\Node\MDN\Node_and_Express\express-locallibrary-tutorial\node_modules\express\lib\router\index.js:335:12)
    at next (C:\Users\Larry\Learning\Node\MDN\Node_and_Express\express-locallibrary-tutorial\node_modules\express\lib\router\index.js:275:10)
    at C:\Users\Larry\Learning\Node\MDN\Node_and_Express\express-locallibrary-tutorial\node_modules\express\lib\router\index.js:635:15
    at next (C:\Users\Larry\Learning\Node\MDN\Node_and_Express\express-locallibrary-tutorial\node_modules\express\lib\router\index.js:260:14)
    at Function.handle (C:\Users\Larry\Learning\Node\MDN\Node_and_Express\express-locallibrary-tutorial\node_modules\express\lib\router\index.js:174:3)
    at router (C:\Users\Larry\Learning\Node\MDN\Node_and_Express\express-locallibrary-tutorial\node_modules\express\lib\router\index.js:47:12)
 */