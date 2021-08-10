// 2021-07-14 bookinstance.js

/*
 * The BookInstance represents a specific copy of a book that someone 
 * might borrow and includes information about whether the copy is 
 * available, on what date it is expected back, and "imprint" 
 * (or version) details.
 */

var mongoose = require('mongoose');

// 2021-07-22 17:28
// Replaces the "moment" library.
/*
 * Note: Luxon can import strings in many formats and export to both 
 * predefined and free - form formats.In this  case we use fromJSDate() 
 * to import a JavaScript date string and toLocaleString() to output 
 * the date in DATE_MED format in English: Oct 6th, 2020.
 * For information about other formats and date string 
 * internationalisation see the Luxon documentation on formatting.
 */
const { DateTime } = require("luxon");

var Schema = mongoose.Schema;

/* 
 * enum: This allows us to set the allowed values of a string. In this 
 *       case, we use it to specify the availability status of our books 
 *       (using an enum means that we can prevent mis-spellings and 
 *       arbitrary values for our status).
 * default: We use default to set the default status for newly created 
 *          bookinstances to maintenance and the default due_back date 
 *          to now (note how you can call the Date function when setting 
 *          the date!).
 */
var BookInstanceSchema = new Schema(
  {
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }, //reference to the associated book
    imprint: {type: String, required: true},
    status: {type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance'},
    due_back: {type: Date, default: Date.now}
  }
);

// Virtual for bookinstance's URL
BookInstanceSchema
.virtual('url')
.get(function () {
  return '/catalog/bookinstance/' + this._id;
});

// 2021-07-22 17:29
// We're replacing the "moment" library with the "luxon" library.
BookInstanceSchema
  .virtual('due_back_formatted')
  .get(function () {
    console.log(`this.due_back is ${this.due_back}`);
    console.log(`due_back_formatted is ${DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED)}`);
    console.log(`Date.now().toLocaleString() is ${Date.now().toLocaleString(DateTime.DATE_MED)}`);
    return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
  });

// Export the model.
module.exports = mongoose.model('BookInstance', BookInstanceSchema);
