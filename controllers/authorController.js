// 2021-07-17 authorController.js

/*
 * The module first requires the model that we'll later be using to 
 * access and update our data. It then exports functions for each of 
 * the URLs we wish to handle (the create, update and delete operations 
 * use forms, and hence also have additional methods for handling form 
 * post requests — we'll discuss those methods in the "forms article" 
 * later on).
 * 
 * All the functions have the standard form of an Express middleware 
 * function, with arguments for the request and response. We could also 
 * include the next function to be called if the method does not complete 
 * the request cycle, but in all these cases it does, so we've omitted it.
 * 
 * The methods return a string indicating that the associated page has not 
 * yet been created. If a controller function is expected to receive path 
 * parameters, these are output in the message string 
 * (see req.params.id above).
 */
var async = require('async');
var Book = require('../models/book');

var Author = require('../models/author');

const { body, validationResult } = require('express-validator');

// Display list of all Authors.
// 2021-07-22 20:51 Replacing this function as instructed on 
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Displaying_data/Author_list_page
/*
exports.author_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Author list');
};
*/
/*
 * The method uses the model's find(), sort() and exec() functions to 
 * return all Author objects sorted by family_name in alphabetic order. 
 * The callback passed to the exec() method is called with any errors 
 * (or null) as the first parameter, or a list of all authors on success. 
 * If there is an error it calls the next middleware function with the 
 * error value, and if not it renders the author_list(.pug) template, 
 * passing the page title and the list of authors (author_list).
 */
exports.author_list = function (req, res, next) {
    Author.find()
        .sort([['family_name', 'ascending']])
        .exec(function (err, list_authors) {
            if (err) { return next(err); }
            // Successful, so render.
            res.render('author_list', { title: 'Author List', author_list: list_authors });
        });
};

// Display detail page for a specific Author.
/*
exports.author_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Author detail: ' + req.params.id);
};
*/
/* 2021-07-25 15:06 Replacing this function as instructed on
 * https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Displaying_data/Author_detail_page
 *
 * The method uses async.parallel() to query the Author and their 
 * associated Book instances in parallel, with the callback rendering 
 * the page when (if) both requests complete successfully. The approach 
 * is exactly the same as described for the Genre detail page.
 */
exports.author_detail = function (req, res, next) {
    async.parallel({
        author: function (callback) {
            Author.findById(req.params.id)
                .exec(callback)
        },
        authors_books: function (callback) {
            Book.find({ 'author': req.params.id }, 'title summary')
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.author == null) { // No results.
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books });
    });
};

// Display Author create form on GET.
// 2021-07-29 11:29
// Replacing this function as instructed on https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms/Create_author_form
/*
exports.author_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author create GET');
};
*/
exports.author_create_get = function (req, res, next) {
    res.render('author_form', { title: 'Create Author' });
};

// Handle Author create on POST.
// 2021-07-29 11:32
// Replacing this function as instructed on https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms/Create_author_form
/* The structure and behavior of this code is almost exactly the same as 
 * for creating a Genre object.First we validate and sanitize the data. 
 * If the data is invalid then we re - display the form along with the 
 * data that was originally entered by the user and a list of error 
 * messages.If the data is valid then we save the new author record and 
 * redirect the user to the author detail page.
 * 
 * Note: Unlike with the Genre post handler, we don't check whether the 
 * Author object already exists before saving it. Arguably we should, 
 * though as it is now we can have multiple authors with the same name.
 * 
 * The validation code demonstrates several new features:
 *   We can daisy chain validators, using withMessage() to specify the 
 *   error message to display if the previous validation method fails. 
 *   This makes it very easy to provide specific error messages without 
 *   lots of code duplication.
 * 
 * We can use the optional() function to run a subsequent validation 
 * only if a field has been entered (this allows us to validate 
 * optional fields).
 *   For example, below we check that the optional date of birth is an 
 *   ISO8601-compliant date (the checkFalsy flag means that we'll accept 
 *   either an empty string or null as an empty value).
 * 
 * Parameters are received from the request as strings. 
 *   We can use toDate() (or toBoolean()) to cast these to the proper 
 *   JavaScript types (as shown at the end of the validator chain below).
 * 
 */
/*
exports.author_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author create POST');
};
*/
exports.author_create_post = [
    // Validate and sanitize fields.
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an Author object with escaped and trimmed data.
            var author = new Author(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                });
            author.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                res.redirect(author.url);
            });
        }
    }
];

// Display Author delete form on GET.
// Handle Author delete on GET.
// 2021-08-01 12:52
// Replacing this function as instructed on 
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms/Delete_author_form
/*
exports.author_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete GET');
};
*/
// Display Author delete form on GET.
/*
 * The controller gets the id of the Author instance to be deleted 
 * from the URL parameter(req.params.id). It uses the async.parallel() 
 * method to get the author record and all associated books in 
 * parallel. When both operations have completed it renders the 
 * author_delete.pug view, passing variables for the title, author, 
 * and author_books.
 */
exports.author_delete_get = function (req, res, next) {
    async.parallel({
        author: function (callback) {
            Author.findById(req.params.id).exec(callback)
        },
        authors_books: function (callback) {
            Book.find({ 'author': req.params.id }).exec(callback)
        },
        // Note: If findById() returns no results the author is not in 
        // the database.In this case there is nothing to delete, so we 
        // immediately render the list of all authors.
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.author == null) { // No results.
            res.redirect('/catalog/authors');
        }
        // Successful, so render.
        res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books });
    });
};

// Handle Author delete on POST.
// 2021-08-01 14:34
// Replacing this function as instructed on 
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms/Delete_author_form
//
// First we validate that an id has been provided (this is sent 
// via the form body parameters, rather than using the version 
// in the URL). Then we get the author and their associated books 
// the same way as for the GET route. If there are no books then 
// we delete the author object and redirect to the list of all authors. 
// If there are still books then we just re-render the form, passing 
// in the author and list of books to be deleted.
//
// Note: We could check if the call to findById() returns any result, 
// and if not,  immediately render the list of all authors.  We've 
// left the code as it is above for brevity (it will still return 
// the list of authors if the id is not found, but this will happen 
// after findByIdAndRemove()).
/*
exports.author_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete POST');
};
*/
// Handle Author delete on POST.
exports.author_delete_post = function (req, res, next) {
    async.parallel({
        author: function (callback) {
            Author.findById(req.body.authorid).exec(callback)
        },
        authors_books: function (callback) {
            Book.find({ 'author': req.body.authorid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success
        if (results.authors_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books });
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err) { return next(err); }
                // Success - go to author list.
                res.redirect('/catalog/authors')
            })
        }
    });
};

// Display Author update form on GET.
// 2021-08-05 11:26 Replacing this function with the code in the downloaded repo at
// C:\Users\Larry\Learning\Node\MDN\Node_and_Express\local_library_repo\express-locallibrary-tutorial\controllers\authorController.js
/*
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};
*/
/*
exports.author_update_get = function (req, res, next) {
    Author.findById(req.params.id, function (err, author) {
        if (err) { return next(err); }
        if (author == null) { // No results.
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('author_form', { title: 'Update Author', author: author });
    });
};
*/
// 2021-08-07 14:29 See https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/deployment
var debug = require('debug')('author');
/*
 * You can then enable a particular set of logs by specifying them as a 
 * comma-separated list in the DEBUG environment variable. You can set 
 * the variables for displaying author and book logs as shown (wildcards 
 * are also supported).
 *
 * #Windows
 *   set DEBUG=author,book
 */
// Display Author update form on GET.
exports.author_update_get = function (req, res, next) {
    req.sanitize('id').escape().trim();
    Author.findById(req.params.id, function (err, author) {
        if (err) {
            debug('update error:' + err);
            return next(err);
        }
        // On success
        res.render('author_form', { title: 'Update Author', author: author });
    });
};

// Handle Author update on POST.
// 2021-08-05 11:28 Replacing this function with the code in the downloaded repo at
// C:\Users\Larry\Learning\Node\MDN\Node_and_Express\local_library_repo\express-locallibrary-tutorial\controllers\authorController.js
/*
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};
*/
exports.author_update_post = [
    // Validate and santize fields.
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Author object with escaped and trimmed data (and the old id!)
        var author = new Author(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('author_form', { title: 'Update Author', author: author, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Author.findByIdAndUpdate(req.params.id, author, {}, function (err, theauthor) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect(theauthor.url);
            });
        }
    }
];