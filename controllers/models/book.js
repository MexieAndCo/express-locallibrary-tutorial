// 2021-07-14 book.js
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
 
/*
 * author is a reference to a single Author model object, and is required.
 * genre is a reference to an array of Genre model objects. 
 * We haven't declared this object yet!
 */
var BookSchema = new Schema(
  {
    title: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: 'Author', required: true},
    summary: {type: String, required: true},
    isbn: {type: String, required: true},
    genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}]
  }
);

// Virtual for the book's URL
BookSchema
.virtual('url')
.get(function () {
  return '/catalog/book/' + this._id;
});

// Export the model.
module.exports = mongoose.model('Book', BookSchema);
