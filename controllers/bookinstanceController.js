// 2021-07-17 bookinstanceController.js
// This follows an identical pattern to the Author controller module.

// 2021-07-20 15:08
// See https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Displaying_data/BookInstance_list_page
/*
 * The BookInstance list controller function needs to get a list of all 
 * book instances, populate the associated book information, and then 
 * pass the list to the template for rendering.
 */

var BookInstance = require('../models/bookinstance');
// Adding the following lines 2021-07-31 as instructed on 
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms/Create_BookInstance_form
const { body, validationResult } = require('express-validator');
var Book = require('../models/book');

var async = require('async');
const { DateTime } = require('luxon');

// Display list of all BookInstances.
// 2021-07-20 15:13
/*
 * Replaced the following code as instructed on
 * https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Displaying_data/BookInstance_list_page
 * exports.bookinstance_list = function (req, res) {
 *  res.send('NOT IMPLEMENTED: BookInstance list');
 * };
 */
/*
 * The method uses the model's find() function to return all BookInstance 
 * objects. It then daisy-chains a call to populate() with the book 
 * field—this will replace the book id stored for each BookInstance with 
 * a full Book document.
 *
 * On success, the callback passed to the query renders the 
 * bookinstance_list(.pug) template, passing the title and 
 * bookinstance_list as variables.
 */
// Display list of all BookInstances.
exports.bookinstance_list = function (req, res, next) {
  BookInstance.find()
    .populate('book')
    .exec(function (err, list_bookinstances) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
    });
};

// Display detail page for a specific BookInstance.
/* 2021-07-25 15:18 Replacing this function as instructed on
 * https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Displaying_data/BookInstance_detail_page_and_challenge
 * 
 * The method calls BookInstance.findById() with the ID of a specific 
 * book instance extracted from the URL (using the route), and accessed 
 * within the controller via the request parameters: req.params.id). 
 * It then calls populate() to get the details of the associated Book.
 */
/*
exports.bookinstance_detail = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance detail: ' + req.params.id);
};
*/
/*
// Display detail page for a specific BookInstance.
/* 2021-07-29 20:19 Replacing this function as instructed on
 * https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Displaying_data/BookInstance_detail_page_and_challenge
 */
/*
exports.bookinstance_detail = function(req, res, next) {
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance==null) { // No results.
          var err = new Error('Book copy not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('bookinstance_detail', { title: 'Copy: '+bookinstance.book.title, bookinstance:  bookinstance});
    })
};
*/
// Display detail page for a specific BookInstance.
/*
 * The method calls BookInstance.findById() with the ID of a specific 
 * book instance extracted from the URL (using the route), and accessed 
 * within the controller via the request parameters: req.params.id). 
 * It then calls populate() to get the details of the associated Book.
 */
exports.bookinstance_detail = function (req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance == null) { // No results.
        var err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render('bookinstance_detail', { title: 'Copy: ' + bookinstance.book.title, bookinstance: bookinstance });
    })
};

// Display BookInstance create form on GET.
// I'm replacing this function as instructed on
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms/Create_BookInstance_form
//
// The controller gets a list of all books (book_list) and passes it 
// to the view bookinstance_form.pug (along with the title).
/*
exports.bookinstance_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance create GET');
};
*/
exports.bookinstance_create_get = function (req, res, next) {
  Book.find({}, 'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books });
    });
};
// Handle BookInstance create on POST.
// I'm replacing this function as instructed on
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms/Create_BookInstance_form
//
// The structure and behavior of this code is the same as for creating 
// our other objects. First we validate and sanitize the data. If the 
// data is invalid, we then re-display the form along with the data that 
// was originally entered by the user and a list of error messages. If 
// the data is valid, we save the new BookInstance record and redirect 
// the user to the detail page.
/*
exports.bookinstance_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance create POST');
};
*/
exports.bookinstance_create_post = [
  // Validate and sanitise fields.
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
  body('status').escape(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    var bookinstance = new BookInstance(
      {
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back
      });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, 'title')
        .exec(function (err, books) {
          if (err) { return next(err); }
          // Successful, so render.
          res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance });
        });
      return;
    }
    else {
      // Data from form is valid.
      bookinstance.save(function (err) {
        if (err) { return next(err); }
        // Successful - redirect to new record.
        res.redirect(bookinstance.url);
      });
    }
  }
];

// Display BookInstance delete form on GET.
// 2021-08-05 11:44 Replacing this function with the code in the downloaded repo at
// C:\Users\Larry\Learning\Node\MDN\Node_and_Express\local_library_repo\express-locallibrary-tutorial\controllers\bookinstanceController.js
/*
exports.bookinstance_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance delete GET');
};
*/
exports.bookinstance_delete_get = function (req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance == null) { // No results.
        res.redirect('/catalog/bookinstances');
      }
      // Successful, so render.
      res.render('bookinstance_delete', { title: 'Delete BookInstance', bookinstance: bookinstance });
    })
};

// Handle BookInstance delete on POST.
// 2021-08-05 11:47 Replacing this function with the code in the downloaded repo at
// C:\Users\Larry\Learning\Node\MDN\Node_and_Express\local_library_repo\express-locallibrary-tutorial\controllers\bookinstanceController.js
/*
exports.bookinstance_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance delete POST');
};
*/
exports.bookinstance_delete_post = function (req, res, next) {
  // Assume valid BookInstance id in field.
  BookInstance.findByIdAndRemove(req.body.id, function deleteBookInstance(err) {
    if (err) { return next(err); }
    // Success, so redirect to list of BookInstance items.
    res.redirect('/catalog/bookinstances');
  });
};

// 2021-08-05 11:48 Replacing this function with the code in the downloaded repo at
// C:\Users\Larry\Learning\Node\MDN\Node_and_Express\local_library_repo\express-locallibrary-tutorial\controllers\bookinstanceController.js
exports.bookinstance_delete_post = function (req, res, next) {
  // Assume valid BookInstance id in field.
  BookInstance.findByIdAndRemove(req.body.id, function deleteBookInstance(err) {
    if (err) { return next(err); }
    // Success, so redirect to list of BookInstance items.
    res.redirect('/catalog/bookinstances');
  });
};

// Display BookInstance update form on GET.
// 2021-08-05 11:49 Replacing this function with the code in the downloaded repo at
// C:\Users\Larry\Learning\Node\MDN\Node_and_Express\local_library_repo\express-locallibrary-tutorial\controllers\bookinstanceController.js
/*
exports.bookinstance_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance update GET');
};
*/
exports.bookinstance_update_get = function (req, res, next) {
  // Get book, authors and genres for form.
  async.parallel({
    bookinstance: function (callback) {
      BookInstance.findById(req.params.id).populate('book').exec(callback)
    },
    books: function (callback) {
      Book.find(callback)
    },

  }, function (err, results) {
    if (err) { return next(err); }
    if (results.bookinstance == null) { // No results.
      var err = new Error('Book copy not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    console.log(DateTime.now().toLocaleString());
    res.render('bookinstance_form', { title: 'Update BookInstance', book_list: results.books, selected_book: results.bookinstance.book._id, bookinstance: results.bookinstance });
  });
};

// Handle bookinstance update on POST.
// 2021-08-05 14:58 Replacing this function with the code in the downloaded repo at
// C:\Users\Larry\Learning\Node\MDN\Node_and_Express\local_library_repo\express-locallibrary-tutorial\controllers\bookinstanceController.js
/*
exports.bookinstance_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance update POST');
};
*/
exports.bookinstance_update_post = [
  // Validate and sanitize fields.
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
  body('status').escape(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),


  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped/trimmed data and current id.
    var bookinstance = new BookInstance(
      {
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back,
        _id: req.params.id
      });

    if (!errors.isEmpty()) {
      // There are errors so render the form again, passing sanitized values and errors.
      Book.find({}, 'title')
        .exec(function (err, books) {
          if (err) { return next(err); }
          // Successful, so render.
          res.render('bookinstance_form', { title: 'Update BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance });
        });
      return;
    }
    else {
      // Data from form is valid.
      BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err, thebookinstance) {
        if (err) { return next(err); }
        // Successful - redirect to detail page.
        res.redirect(thebookinstance.url);
      });
    }
  }
];