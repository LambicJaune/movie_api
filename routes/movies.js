const express = require('express');
const router = express.Router();
const Models = require('../models/models.js');
const Movies = Models.Movie;
const passport = require('passport');

/**
 * Get all movies
 * @route GET /movies
 * @group Movies - Operations about movies
 * @returns {Array.<object>} 200 - An array of movies
 * @returns {Error} 500 - Internal server error
 */
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
router.get('/genres/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const movies = await Movies.find({ 'genre.name': req.params.genreName });

        if (!movies || movies.length === 0) {
            return res.status(404).send('No movies found for the given genre');
        }

        res.status(200).json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
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
router.get('/directors/:directorName/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
router.get('/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
router.get('/title/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ title: req.params.title })
        .then((movie) => {
            res.status(200).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


module.exports = router;
