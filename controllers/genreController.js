var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');
const validator = require('express-validator');


// Display list of all Genre.
exports.genre_list = function(req, res, next) {
    Genre.find()
    .sort([['name', 'ascending']])
    .exec( function(err, list_genres) {
        if (err) { return next(err) }

        res.render('genre_list', { title: 'Genre List', genre_list: list_genres});
    });
};

// Display detail page for a specific Genre.
// exports.genre_detail = function(req, res, next) {
//     async.parallel({
//         genre: function(callback) {
//             Genre.findById(req.params.id)
//             .exec(callback);
//         },
//         genre_books: function(callback) {
//             Book.find({ 'genre': req.params.id })
//             .exec(callback);
//         }
//     }, function (err, results) {
//         if (err) { return next(err) }
//         if (results.genre == null) {
//             var err = new Error('Genre not found');
//             err.status = 404;
//             return next(err);
//         };
//         res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books });
//     });
// };

exports.genre_detail = function(req, res, next) {
    console.log("LOLLL")
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id)
              .exec(callback);
        },

        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id })
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        console.log("No errorr")
        if (results.genre==null) { // No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books } );
    });

};


// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [
    validator.body('name', 'Genre name required').trim().isLength({ min:1 }),
    validator.sanitizeBody('name').escape(),
    (req,res,next) => {
        const errors = validator.validationResult(req);

        var genre = new Genre(
            { name: req.body.name }
        );
        if (!errors.isEmpty()) {
            res.render('genre_form', {title: 'Create Genre', genre: genre, errors: errors.array()});
            return;
        }
        else {

            Genre.findOne({ name: req.body.name })
                .exec( function(err, found_genre)   {
                    if(err) { return next(err) }

                    if( found_genre) {
                        res.redirect(found_genre.url);
                    }
                    else {
                        
                        genre.save(function (err) {
                            if (err) {return next(err); }
                            res.redirect(genre.url);
                        });
                    }
                });
        }
    }
];


// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next) {

    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback)
        },
        books: function(callback) {
          Book.find({ 'genre': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) { // No results.
            res.redirect('/catalog/books');
        }
        // Successful, so render.
        res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.books } );
    });

};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res, next) {

    async.parallel({
        book: function(callback) {
          Genre.findById(req.body.genreid).exec(callback)
        },
        books: function(callback) {
          Book.find({ 'genre': req.body.genreid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.books.length > 0) {
            // Book has book instances. Render in same way as for GET route.
            res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.books } );
            return;
        }
        else {
            // Book has no book instances. Delete object and redirect to the list of books.
            Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/catalog/genres')
            })
        }
    });
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res, next) {
    Genre.findById(req.params.id).exec( function(err, genre) {
        if (err) { return next(err)}

        if (genre==null) { // No results.
            res.redirect('/catalog/books');
        }    

        res.render('genre_form', {title: 'Update Genre', genre: genre});
    })
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    Genre.findById(req.params.id).exec( function(err, genre) {
        if (err) { return next(err)}

        if (genre==null) { // No results.
            res.redirect('/catalog/books');
        }    
        var genre = {
            name: req.body.name,
            _id: req.params.id
        }
        Genre.findByIdAndUpdate(req.params.id, genre, function(err, updatedGenre) {
            if(err) {return next(err)}

            res.redirect(updatedGenre.url)
        });
    });
};
