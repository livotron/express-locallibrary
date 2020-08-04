var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Genre = new Schema(
  {
    name: {type: String, required: true, minlength: 3, maxlength: 100}
  }
);

// Virtual for book's URL
Genre
.virtual('url')
.get(function () {
  return '/catalog/genre/' + this._id;
});

//Export model
module.exports = mongoose.model('Genre', Genre);
