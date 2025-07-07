const mongoose = require('mongoose');
const Models = require('./models/models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/TomHanksAppDB');

const express = require('express'),
    app = express(),
    //logging middleware
    morgan = require('morgan'),
    uuid = require('uuid');

const lodash = require('lodash');    

//imports body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//import auth.js file (creates new endpoint for registered users to login)
let auth = require('./auth')(app);

//requires the Passport module and import the "passport.js" file
const passport = require('passport');
require('./passport');

app.use(morgan('common'));

//send static files from the "public" directory
app.use(express.static('public'));

//parses JSON in the request body
app.use(express.json());

// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to the Tom Hanks app!');
});

//get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});
/**
 * Get movie by title
 * @route GET /movies/:title
 * @group Movies - Operations about movies
 * @param {string} title.path.required - Title of the movie to retrieve
 * @returns {object} 200 - JSON object of the matching movie
 * @returns {Error} 404 - Movie not found
 * @returns {Error} 500 - Internal server error
 * @example Request:
 *     GET /movies/Sully
 * @example Response:
 *     {
 *       "title": "Sully",
 *       "director": {
 *          "name": "Clint Eastwood",
 *          "bio": "...",
 *          "birth": 1930
 *       },
 *       "genres": [
 *          {
 *            "name": "Biography",
 *            "description": "..."
 *          }
 *       ],
 *       "description": "The story of Chesley 'Sully' Sullenberger...",
 *       "imageURL": "http://example.com/image.jpg",
 *       "featured": true
 *     }
 */
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ title: req.params.title })
        .then((movie) => {
            res.status(200).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * Get a list of movies by genre
 * @route GET /genres/:genreName
 * @group Genres - Operations related to movie genres
 * @param {string} genreName.path.required - Name of the genre to filter movies by
 * @returns {Array.<object>} 200 - List of movies matching the genre
 * @returns {Error} 404 - No movies found for the given genre
 * @returns {Error} 500 - Internal server error
 * @example Request:
 *     GET /genres/Biography
 * @example Response:
 *     [
 *       {
 *         "title": "Catch Me If You Can",
 *         "director": {
 *           "name": "Steven Spielberg",
 *           "bio": "...",
 *           "birth": 1946
 *         },
 *         "genres": [
 *           {
 *             "name": "Biography",
 *             "description": "..."
 *           }
 *         ],
 *         "description": "...",
 *         "imageURL": "http://example.com/image.jpg",
 *         "featured": false
 *       },
 *       {
 *         "title": "Sully",
 *         "director": {
 *           "name": "Clint Eastwood",
 *           "bio": "...",
 *           "birth": 1930
 *         },
 *         "genres": [
 *           {
 *             "name": "Biography",
 *             "description": "..."
 *           }
 *         ],
 *         "description": "...",
 *         "imageURL": "http://example.com/image2.jpg",
 *         "featured": true
 *       }
 *     ]
 */
app.get('/genres/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find({ 'genre.name': req.params.genreName })
        .then((movie) => {
            res.status(200).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


/**
 * Get all movies directed by a specific director
 * @route GET /directors/:directorName/movies
 * @group Movies - Operations related to movies
 * @param {string} directorName.path.required - Name of the director to filter movies by
 * @returns {Array.<object>} 200 - An array of movie objects directed by the specified director
 * @returns {Error} 500 - Internal server error
 * @example Request:
 *     GET /directors/Sam%20Mendes/movies
 * @example Response:
 *     [
 *       {
 *         "genre": {
 *           "name": "Crime",
 *           "description": "Crime films portray illegal acts..."
 *         },
 *         "director": {
 *           "name": "Sam Mendes",
 *           "bio": "British director known for...",
 *           "birth": "1965-08-01",
 *           "death": ""
 *         },
 *         "_id": "68639866fdce14bfc0748a63",
 *         "title": "Road to Perdition",
 *         "description": "A mob enforcer's son witnesses a murder...",
 *         "imagePath": "https://example.com/image.jpg",
 *         "featured": false
 *       }
 *     ]
 */
app.get('/directors/:directorName/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find({ 'director.name': req.params.directorName })
        .then((movie) => {
            res.status(200).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * Get details about a director
 * @route GET /directors/:directorName
 * @group Directors - Operations related to movie directors
 * @param {string} directorName.path.required - Name of the director to retrieve
 * @returns {object} 200 - JSON object of the matching director's info
 * @returns {Error} 404 - Director not found
 * @returns {Error} 500 - Internal server error
 * @example Request:
 *     GET /directors/Clint%20Eastwood
 * @example Response:
 *     {
 *       "name": "Clint Eastwood",
 *       "bio": "An American actor and filmmaker known for...",
 *       "birth": 1930,
 *       "death": null
 *     }
 */
app.get('/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ 'director.name': req.params.directorName })
        .then((movie) => {
            if (!movie) {
                return res.status(404).send('Director not found');
            }
            res.status(200).json(movie.director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


/**
 * Registers/adds a new user
 * @route POST /users
 * @group Users - Operations related to users
 * @param {object} user.body.required - The new user object
 * @param {string} user.Username.required - Username of the new user
 * @param {string} user.Password.required - Password for the user account
 * @param {string} user.Email.required - Email address of the user
 * @param {string} user.Birthday.required - Birthday in ISO format (e.g. "1990-01-01")
 * @param {Array.<string>} [user.FavoriteMovies] - Array of movie ObjectIds as strings
 * @returns {object} 201 - The newly created user object
 * @returns {Error} 400 - Username already exists or missing required fields
 * @returns {Error} 500 - Internal server error
 * @example Request:
 *     {
 *       "Username": "john_doe",
 *       "Password": "PW123!",
 *       "Email": "john@example.com",
 *       "Birthday": "1990-01-01",
 *       "FavoriteMovies": ["68639866fdce14bfc0748a5f", "68639866fdce14bfc0748a60"]
 *     }
 * @example Response:
 *     {
 *       "_id": "60d21b4667d0d8992e610c85",
 *       "Username": "john_doe",
 *       "Email": "john@example.com",
 *       "Birthday": "1990-01-01T00:00:00.000Z",
 *       "FavoriteMovies": ["68639866fdce14bfc0748a5f", "68639866fdce14bfc0748a60"]
 *     }
 */
app.post('/users', async (req, res) => {
    await Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + ' already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: req.body.Password,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday,
                    })
                    .then((user) => {
                        const userResponse = lodash.pick(user.toObject(), ['Username', 'Email', 'Birthday']);
                        res.status(201).json(userResponse)
                    })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

/**
 * Updates a user's information (including username)
 * @route PUT /users/:userName
 * @group Users - Operations related to users
 * @param {string} userName.path.required - The current username of the user
 * @param {object} user.body.required - The updated user data
 * @param {string} [user.Username] - The new username for the user
 * @param {string} [user.Password] - The new password for the user
 * @param {string} [user.Email] - The new email for the user
 * @param {string} [user.Birthday] - The new birthday (ISO date string)
 * @param {Array.<string>} [user.FavoriteMovies] - The new array of favorite movie ObjectId strings
 * @returns {object} 200 - The updated user object
 * @returns {Error} 404 - User not found
 * @returns {Error} 500 - Internal server error
 * @example Request:
 *     PUT /users/JohnDoe
 *     {
 *       "Username": "JohnMalkovitch",
 *       "Email": "johnm@example.com"
 *     }
 * @example Response:
 *     {
 *       "_id": "60d21b4667d0d8992e610c85",
 *       "Username": "JohnMalkovitch",
 *       "Email": "johnm@example.com",
 *       "Birthday": "1990-01-01T00:00:00.000Z",
 *       "FavoriteMovies": ["68639866fdce14bfc0748a5f"]
 *     }
 */
app.put('/users/:userName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // condition to make sure that the username in the request body matches the one in the request parameter
    if (req.user.Username !== req.params.userName) {
        return res.status(400).send('Permission denied');
    } //end of the condition 
    await Users.findOneAndUpdate({ Username: req.params.userName }, {
        $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
            FavoriteMovies: req.body.FavoriteMovies
        }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        })

});

/**
 * Deletes a user
 * @route DELETE /users/:userName
 * @group Users - Operations related to users
 * @param {string} userName.path.required - userName of the user to delete
 * @returns {string} 200 - Confirmation message
 * @returns {Error} 404 - User not found
 * @example Request:
 *     DELETE /users/JohnDoe
 * @example Response:
 *     "User JohnDoe was deleted."
 */
app.delete('/users/:userName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    console.log('JWT payload:', req.user);
    console.log('Request param:', req.params.userName);
    if (req.user.Username !== req.params.userName) {
        return res.status(403).send('You can only delete your own account');
    }
    await Users.findOneAndDelete({ Username: req.params.userName })
        .then((user) => {
            if (!user) {
                res.status(404).send(req.params.userName + ' was not found');
            } else {
                res.status(200).send(req.params.userName + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


/**
 * Adds a movie to a user's favorites
 * @route POST /users/:userName/favorites/:movieID
 * @group Users - Operations related to users
 * @param {string} userName.path.required - Name of the user
 * @param {string} movieID.path.required - ID of the movie to add to favorites
 * @returns {string} 200 - Confirmation that the movie was added
 * @returns {Error} 404 - User not found
 * @example Request:
 *     POST /users/JohnDoe/favorites/02
 * @example Response:
 *     "Movie 02 was added to JohnDoe's favorites."
 */
app.post('/users/:userName/favorites/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.userName }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


/**
 * Removes a movie from user's favorites
 * @route DELETE /users/:userName/favorites/:movieID
 * @group Users - Operations related to users
 * @param {string} userName.path.required - Name of the user
 * @param {string} movieID.path.required - ID of the movie to remove from favorites
 * @returns {string} 200 - Confirmation that the movie was removed
 * @returns {Error} 404 - User not found or movie not found in favorites
 * @example Request:
 *     DELETE /users/JohnDoe/favorites/02
 * @example Response:
 *     "Movie 02 was removed from your favorites."
 */
app.delete('/users/:userName/favorites/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.userName }, {
        $pull: { FavoriteMovies: req.params.MovieID }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//handles errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});