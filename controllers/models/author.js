// /models/author.js
var mongoose = require('mongoose');
const { DateTime } = require("luxon"); // for date handling

var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
  {
    first_name: { type: String, required: true, maxLength: 100 },
    family_name: { type: String, required: true, maxLength: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date },
  }
);

// Virtual for author's full name
AuthorSchema
  .virtual('name')
  .get(function () {
    return this.family_name + ', ' + this.first_name;
  });

// Virtual for author's lifespan
AuthorSchema
  .virtual('lifespan')
  .get(function () {   // fix this up next time (Friday, July 22, 2021)
                       // See https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Displaying_data/Author_list_page
    // return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
    // From C:\Users\Larry\Learning\Node\MDN\Node_and_Express\local_library_repo\express-locallibrary-tutorial\models\author.js
    // (my cloned repo from https://github.com/mdn/express-locallibrary-tutorial)
    var lifetime_string = '';
    if (this.date_of_birth) {
      lifetime_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
    }
    if (this.date_of_death) {
      lifetime_string += ' - ';
      lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
    }
    if (this.date_of_birth)
      lifetime_string = '(' + lifetime_string + ')';
    return lifetime_string;
  });

/*
 * Declaring our URLs as a virtual in the schema is a good idea
 * because then the URL for an item only ever needs to be changed
 * in one place.
 * At this point, a link using this URL wouldn't work, because we
 * haven't got any routes handling code for individual model
 * instances.We'll set those up in a later article!
 */

// Virtual for author's URL
AuthorSchema
  .virtual('url')
  .get(function () {
    return '/catalog/author/' + this._id;
  });

//Export model
module.exports = mongoose.model('Author', AuthorSchema);
