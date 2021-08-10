// 2021-07-17 bookController.js
// This follows the same pattern as the other controller modules, 
// but additionally has an index() function for displaying the 
// site welcome page.

/*
var Book = require('../models/book');

exports.index = function (req, res) {
  res.send('NOT IMPLEMENTED: Site Home Page');
};
*/

// 2021-07-25 12:31
// Note: We don't need to require async and BookInstance in this step, as 
// we already imported those modules when we implemented the home page controller.

// 2021-07-17 18:23
// Replaced the above code as instructed here:
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Displaying_data/Home_page
var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

var async = require('async');

// Adding this require on 2021-07-29 20:37 as instructed on
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms/Create_book_form
const { body, validationResult } = require('express-validator');

exports.index = function (req, res) {
  /*
   * The async.parallel() method is passed an object with functions for 
   * getting the counts for each of our models. These functions are all 
   * started at the same time. When all of them have completed the final 
   * callback is invoked with the counts in the results parameter 
   * (or an error).
   * 
   * The method uses async.parallel() to find the Book and its 
   * associated copies (BookInstances) in parallel. The approach is 
   * exactly the same as described for the Genre detail page. Since 
   * the key 'title' is used to give name to the webpage (as defined 
   * in the header in 'layout.pug'), this time we are passing 
   * results.book.title while rendering the webpage.
   */
  async.parallel({
    book_count: function (callback) {
      Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
    },
    book_instance_count: function (callback) {
      BookInstance.countDocuments({}, callback);
    },
    book_instance_available_count: function (callback) {
      BookInstance.countDocuments({ status: 'Available' }, callback);
    },
    author_count: function (callback) {
      Author.countDocuments({}, callback);
    },
    genre_count: function (callback) {
      Genre.countDocuments({}, callback);
    }
  /*
   * On success the callback function calls res.render(), specifying a 
   * view (template) named 'index' and an object containing the data 
   * that is to be inserted into it (this includes the results object 
   * that contains our model counts). The data is supplied as key-value 
   * pairs, and can be accessed in the template using the key.
   */
  }, function (err, results) {
    res.render('index', { title: 'Local Library Home', error: err, data: results });
  });
};
/*
 * Note: The callback function from async.parallel() above is a 
 * little unusual in that we render the page whether or not there 
 * was an error (normally you might use a separate execution path 
 * for handling the display of errors).
 */

// Display list of all books.
// Replacing the following code as instructed on
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Displaying_data/Book_list_page
/*
exports.book_list = function (req, res) {
  res.send('NOT IMPLEMENTED: Book list');
};
*/
// Display list of all Books.
/*
 * The method uses the model's find() function to return all Book 
 * objects, selecting to return only the title and author as we don't 
 * need the other fields (it will also return the _id and virtual 
 * fields). Here we also call populate() on Book, specifying the author 
 * field—this will replace the stored book author id with the full author 
 * details.
 *
 * On success, the callback passed to the query renders the 
 * book_list(.pug) template, passing the title and book_list (list 
 * of books with authors) as variables.
 */
exports.book_list = function (req, res, next) {
  Book.find({}, 'title author')
    .populate('author')
    .exec(function (err, list_books) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('book_list', { title: 'Book List', book_list: list_books });
    });
};

// Display detail page for a specific book.
/* 2021-07-25 11:43 Replacing this function as instructed on
 * https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Displaying_data/Book_detail_page
 */
/*
exports.book_detail = function (req, res) {
  res.send('NOT IMPLEMENTED: Book detail: ' + req.params.id);
};
*/
exports.book_detail = function (req, res, next) {
  async.parallel({
    book: function (callback) {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    book_instance: function (callback) {
      BookInstance.find({ 'book': req.params.id })
        .exec(callback);
    },
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.book == null) { // No results.
      var err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    // Successful, so render.
    res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instance });
  });
};

// Display book create form on GET.
// Replacing this function as instructed on
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms/Create_book_form
/*
 * This uses the async module (described in Express Tutorial Part 5: 
 * Displaying library data) to get all Author and Genre objects. These 
 * are then passed to the view book_form.pug as variables named authors
 * and genres (along with the page title).
 */
/*
exports.book_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Book create GET');
};
*/
exports.book_create_get = function (req, res, next) {
  // Get all authors and genres, which we can use for adding to our book.
  async.parallel({
    authors: function (callback) {
      Author.find(callback);
    },
    genres: function (callback) {
      Genre.find(callback);
    },
  }, function (err, results) {
    if (err) { return next(err); }
    res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
  });
};

// Handle book create on POST.
// Replacing this function as instructed on
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms/Create_book_form
/*
 * The structure and behavior of this code is almost exactly the same as 
 * for creating a Genre or Author object. First we validate and sanitize 
 * the data. If the data is invalid then we re-display the form along with 
 * the data that was originally entered by the user and a list of error 
 * messages. If the data is valid, we then save the new Book record and 
 * redirect the user to the book detail page.
 *
 * The main difference with respect to the other form handling code is 
 * how we sanitize the genre information. The form returns an array of 
 * Genre items (while for other fields it returns a string). In order 
 * to validate the information we first convert the request to an array 
 * (required for the next step).
 * 
 * We then use a wildcard (*) in the sanitiser to individually validate 
 * each of the genre array entries. The code below shows how - this 
 * translates to "sanitise every item below key genre".
 *     body('genre.*').escape(),
 * 
 * The final difference with respect to the other form handling code is 
 * that we need to pass in all existing genres and authors to the form. 
 * In order to mark the genres that were checked by the user we iterate 
 * through all the genres and add the checked='true' parameter to those 
 * that were in our post data (as reproduced in the code fragment below).
 * // Mark our selected genres as checked.
 * for (let i = 0; i < results.genres.length; i++) {
 *   if (book.genre.indexOf(results.genres[i]._id) > -1) {
 *     // Current genre is selected. Set "checked" flag.
 *     results.genres[i].checked = 'true';
 *   }
 * }
 */
/*
exports.book_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book create POST');
};
*/
// Handle book create on POST.
exports.book_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined')
        req.body.genre = [];
      else
        req.body.genre = new Array(req.body.genre);
    }
    next();
  },
  // Validate and sanitise fields.
  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  // We then use a wildcard(*) in the sanitiser to individually validate 
  // each of the genre array entries.The code below shows how - this 
  // translates to "sanitise every item below key genre".
  body('genre.*').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    var book = new Book(
      {
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: req.body.genre
      });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel({
        authors: function (callback) {
          Author.find(callback);
        },
        genres: function (callback) {
          Genre.find(callback);
        },
      }, function (err, results) {
        if (err) { return next(err); }

        // Mark our selected genres as checked.
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true';
          }
        }
        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
      });
      return;
    }
    else {
      // Data from form is valid. Save book.
      book.save(function (err) {
        if (err) { return next(err); }
        // Successful - redirect to new book record.
        res.redirect(book.url);
      });
    }
  }
];

// Display book delete form on GET.
// 2021-08-04 20:21 -- I'm replacing this function with the one downloaded 
// from the MDN LocalLibrary tutorial repo, which I have here:
// C:\Users\Larry\Learning\Node\MDN\Node_and_Express\local_library_repo\express-locallibrary-tutorial\controllers\booController.js
/*
exports.book_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Book delete GET');
};
*/
exports.book_delete_get = function (req, res, next) {
  async.parallel({
    book: function (callback) {
      Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
    },
    book_bookinstances: function (callback) {
      BookInstance.find({ 'book': req.params.id }).exec(callback);
    },
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.book == null) { // No results.
      res.redirect('/catalog/books');
    }
    // Successful, so render.
    res.render('book_delete', { title: 'Delete Book', book: results.book, book_instances: results.book_bookinstances });
  });
};

// Handle book delete on POST.
// 2021-08-04 20:23 -- I'm replacing this function with the one downloaded 
// from the MDN LocalLibrary tutorial repo, which I have here:
// C:\Users\Larry\Learning\Node\MDN\Node_and_Express\local_library_repo\express-locallibrary-tutorial\controllers\booController.js
/*
exports.book_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book delete POST');
};
*/
exports.book_delete_post = function (req, res, next) {
  // Assume the post has valid id (ie no validation/sanitization).
  async.parallel({
    book: function (callback) {
      Book.findById(req.body.id).populate('author').populate('genre').exec(callback);
    },
    book_bookinstances: function (callback) {
      BookInstance.find({ 'book': req.body.id }).exec(callback);
    },
  }, function (err, results) {
    if (err) { return next(err); }
    // Success
    if (results.book_bookinstances.length > 0) {
      // Book has book_instances. Render in same way as for GET route.
      res.render('book_delete', { title: 'Delete Book', book: results.book, book_instances: results.book_bookinstances });
      return;
    }
    else {
      // Book has no BookInstance objects. Delete object and redirect to the list of books.
      Book.findByIdAndRemove(req.body.id, function deleteBook(err) {
        if (err) { return next(err); }
        // Success - got to books list.
        res.redirect('/catalog/books');
      });
    }
  });
};

// Display book update form on GET.
// This final subarticle shows how to define a page to update Book objects. 
// Form handling when updating a book is much like that for creating a 
// book, except that you must populate the form in the GET route with 
// values from the database.
//
// 2021-08-01 17:30 Replacing this function as instructed on
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms/Update_Book_form
/*
 * The controller gets the id of the Book to be updated from the URL 
 * parameter (req.params.id). It uses the async.parallel() method to 
 * get the specified Book record (populating its genre and author fields) 
 * and lists of all the Author and Genre objects.
 *
 * When the operations complete it checks for any errors in the find 
 * operation, and also whether any books were found.
 *
 * Note: Not finding any book results is not an error for a search — 
 * but it is for this application because we know there must be a 
 * matching book record! The code above compares for (results==null) 
 * in the callback, but it could equally well have daisy chained the 
 * method orFail() to the query.
 *
 * We then mark the currently selected genres as checked and then 
 * render the book_form.pug view, passing variables for title, book, 
 * all authors, and all genres.
 */
/*
exports.book_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Book update GET');
};
*/

// 2021-08-01 20:06 Replacing this function as instructed on
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms/Update_Book_form
/*
exports.book_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Book update GET');
};
*/
var debug = require('debug')('book');
exports.book_update_get = function (req, res, next) {
  // Get book, authors and genres for form.
  async.parallel({
    book: function (callback) {
      Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
    },
    authors: function (callback) {
      Author.find(callback);
    },
    genres: function (callback) {
      Genre.find(callback);
    },
  }, function (err, results) {
    if (err) {
      debug('update error:' + err);
      return next(err); }
    if (results.book == null) { // No results.
      var err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    // Mark our selected genres as checked.
    for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
      for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
        if (results.genres[all_g_iter]._id.toString() === results.book.genre[book_g_iter]._id.toString()) {
          results.genres[all_g_iter].checked = 'true';
        }
      }
    }
    res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book });
  });
};

// Handle book update on POST.
// 2021-08-01 20:06 Replacing this function as instructed on
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms/Update_Book_form
/*
exports.book_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book update POST');
};
*/
/* 
 * This is very similar to the post route used when creating a Book. 
 * First we validate and sanitize the book data from the form and use 
 * it to create a new Book object(setting its _id value to the id of 
 * the object to update). If there are errors when we validate the 
 * data then we re-render the form, additionally displaying the 
 * data entered by the user, the errors, and lists of genres and 
 * authors. If there are no errors then we call Book.findByIdAndUpdate() 
 * to update the Book document, and then redirect to its detail page.
 */
exports.book_update_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined')
        req.body.genre = [];
      else
        req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate and sanitise fields.
  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genre.*').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    var book = new Book(
      {
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
        _id: req.params.id //This is required, or a new ID will be assigned!
      });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel({
        authors: function (callback) {
          Author.find(callback);
        },
        genres: function (callback) {
          Genre.find(callback);
        },
      }, function (err, results) {
        if (err) { return next(err); }

        // Mark our selected genres as checked.
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true';
          }
        }
        res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
      });
      return;
    }
    else {
      // Data from form is valid. Update the record.
      Book.findByIdAndUpdate(req.params.id, book, {}, function (err, thebook) {
        if (err) { return next(err); }
        // Successful - redirect to book detail page.
        res.redirect(thebook.url);
      });
    }
  }
];