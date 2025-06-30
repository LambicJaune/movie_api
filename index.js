const express = require('express'),
    app = express(),
    //logging middleware
    morgan = require('morgan'),
    uuid = require('uuid');

const movies = [
    {
        title: 'Forrest Gump',
        director: 'Robert Zemeckis',
        genres: 'drama',
        description: '',
        imageURL: '',
        movieID: '01'
    },
    {
        title: 'The Green Mile',
        director: 'Frank Darabont',
        genres: 'crime',
        description: '',
        imageURL: '',
        movieID: '02'
    },
    {
        title: 'Cast Away',
        director: 'Robert Zemeckis',
        genres: 'adventure',
        description: '',
        imageURL: '',
        movieID: '03'
    },
    {
        title: 'Philadelphia',
        director: 'Jonathan Demme',
        genres: 'drama',
        description: '',
        imageURL: '',
        movieID: '04'
    },
    {
        title: 'Road to Perdition',
        director: 'Sam Mendes',
        genres: 'crime',
        description: '',
        imageURL: '',
        movieID: '05'
    },
    {
        title: 'Catch Me If You Can',
        director: 'Steven Spielberg',
        genres: 'biography',
        description: '',
        imageURL: '',
        movieID: '06'
    },
    {
        title: 'The Terminal',
        director: 'Steven Spielberg',
        genres: 'comedy',
        description: '',
        imageURL: '',
        movieID: '07'
    },
    {
        title: 'The Da Vinci Code',
        director: 'Ron Howard',
        genres: 'mystery',
        description: '',
        imageURL: '',
        movieID: '08'
    },
    {
        title: 'Big',
        director: 'Penny Marshall',
        genres: 'fantasy',
        description: '',
        imageURL: '',
        movieID: '09'
    },
    {
        title: 'Sully',
        director: 'Clint Eastwood',
        genres: 'biography',
        description: '',
        imageURL: '',
        movieID: '10'
    }];

const directors = [
    {
        name: 'Robert Zemeckis',
        bio: '',
        birth: 1951,
        death: 'still alive'
    },
    {
        name: 'Frank Darabont',
        bio: '',
        birth: 1959,
        death: 'still alive'
    },
    {
        name: 'Jonathan Demme',
        bio: '',
        birth: 1944,
        death: 2017,
    },
    {
        name: 'Sam Mendes',
        bio: '',
        birth: 1965,
        death: 'still alive'
    },
    {
        name: 'Steven Spielberg',
        bio: '',
        birth: 1946,
        death: 'still alive'
    },
    {
        name: 'Ron Howard',
        bio: '',
        birth: 1954,
        death: 'still alive'
    },
    {
        name: 'Penny Marshall',
        bio: '',
        birth: 1943,
        death: 2018
    },
    {
        name: 'Clint Eastwood',
        bio: '',
        birth: 1930,
        death: 'still alive'
    }
];

let users = [];

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
app.get('/movies', (req, res) => {
    res.json(movies);
});
/**
 * Get movie by title
 * @route GET /movies/:title
 * @group Movies - Operations about movies
 * @param {string} title.path.required - Title of the movie to retrieve
 * @returns {object} 200 - JSON object of the matching movie
 * @returns {Error} 404 - Movie not found
 * @example Request:
 *     GET /movies/Sully
 * @example Response:
 *     {
 *       "title": "Sully",
 *       "director": "Clint Eastwood",
 *       "genres": biography
 *     }
 */
app.get('/movies/:title', (req, res) => {
    res.json(movies.find((movie) => { return movie.title === req.params.title }))
});
/**
 * get a list of movies by genre
 * @route GET /genres/:genreName
 * @group Genres - Operations related to movie genres
 * @param {string} genreName.path.required - Name of the genre to filter movies by
 * @returns {Array.<object>} 200 - List of movies matching the genre
 * @returns {Error} 404 - No movies found for the given genre
 * @example Request:
 *     GET /genres/biography
 * @example Response:
 *     [
 *      {
 *         "title": 'Catch Me If You Can',
           "director": 'Steven Spielberg',
           "genres": 'biography',
         }
 *       {
 *         "title": "Sully",
 *         "director": "Clint Eastwood",
 *         "genres": "biography",
 *       }
 *     ]
 */
app.get('/genres/:genreName', (req, res) => {
    res.json(movies.filter((movie) => { return movie.genres === req.params.genreName }))
});

/**
 * get a list of deatails about a director
 * @route GET /directors/:directorName
 * @group Directors - Operations related to movie directors
 * @param {string} directorName.path.required - Name of the director to retrieve
 * @returns {object} 200 - JSON object of the matching director
 * @returns {Error} 404 - Director not found
 * @example Request:
 *     GET /directors/Clint%20Eastwood
 * @example Response:
 *     {
 *       "name": 'Clint Eastwood',
 *       "bio": '',
 *       "birth": '1930',
 *       "death": 'still alive'
 *     }
 */
app.get('/directors/:directorName', (req, res) => {
    res.json(directors.find((director) => { return director.name === req.params.directorName }))
});

/**
 * registers/adds a new user
 * @route POST /users
 * @group Users - Operations related to users
 * @param {object} user.body.required - The new user object
 * @param {string} user.name.required - Name of the user
 * @returns {object} 201 - The newly created user
 * @returns {Error} 400 - Missing required fields
 * @example Request:
 *     {
 *       "name": "John Doe"
 *     }
 * @example Response:
 *     {
 *       "id": "71c82a05-734b-4bb6-8205-fd4ed0f26d91",
 *       "name": "John Doe"
 *     }
 */
app.post('/users', (req, res) => {
    let newUser = req.body;

    if (!newUser.name) {
        const message = 'Missing name in request body';
        res.status(400).send(message);
    } else {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).send(newUser);
    }
});

/**
 * updates a user's name
 * @route PUT /users/:userName
 * @group Users - Operations related to users
 * @param {string} userName.path.required - The current name of the user
 * @param {string} name.body.required - The new name for the user
 * @returns {string} 200 - Confirmation that the name was updated
 * @returns {Error} 404 - User not found
 * @example Request:
 *     PUT /users/John%20Doe
 *     {
 *       "name": "John Malkovitch"
 *     }
 * @example Response:
 *     "User name was updated to John Malkovitch"
 */
app.put('/users/:userName', (req, res) => {
    let user = users.find((user) => user.name === req.params.name);

    if (user) {
        user.name = req.body.name;
        res.status(200).send('User name was updated to ' + req.body.name);
    } else {
        res.status(404).send('User with the name ' + req.params.name + ' was not found.');
    }
});

/**
 * deletes a user
 * @route DELETE /users/:id
 * @group Users - Operations related to users
 * @param {string} id.path.required - ID of the user to delete
 * @returns {string} 200 - Confirmation message
 * @returns {Error} 404 - User not found
 * @example Request:
 *     DELETE /users/71c82a05-734b-4bb6-8205-fd4ed0f26d91
 * @example Response:
 *     "User 71c82a05-734b-4bb6-8205-fd4ed0f26d91 was deleted."
 */

app.delete('/users/:id', (req, res) => {
    let user = users.find((user) => { return user.id === req.params.id });

    if (user) {
        users = users.filter((obj) => { return obj.id !== req.params.id });
        res.status(200).send('User ' + req.params.id + ' was deleted.');
    }
    else {
        return res.status(404).send('User with the ID ' + req.params.id + ' was not found.');

    }
});


/**
 * adds a movie to a user's favorites
 * @route POST /users/:userName/favorites/:movieID
 * @group Users - Operations related to users
 * @param {string} userName.path.required - Name of the user
 * @param {string} movieID.path.required - ID of the movie to add to favorites
 * @returns {string} 200 - Confirmation that the movie was added
 * @returns {Error} 404 - User not found
 * @example Request:
 *     POST /users/John%20Doe/favorites/02
 * @example Response:
 *     "Movie 02 was added to John Doe's favorites."
 */
app.post('/users/:name/favorites/:movieID', (req, res) => {
    let name = req.params.name;
    let movieID = req.params.movieID;

    // Find the user by name
    let user = users.find(function (user) {
        return user.name === name;
    });

    if (!user) {
        res.status(404).send('User with the name ' + name + ' was not found.');
        return;
    }

    // Initialize the favorites array if it doesn't already exist
    if (!user.favorites) {
        user.favorites = [];
    }

    // Add movie to favorites
    user.favorites.push(movieID);
    res.status(200).send('Movie ' + movieID + ' was added to ' + name + '\'s favorites.');
});

/**
 * removes movie from favorites
 * @route POST /users/:userName/favorites/:movieID
 * @group Users - Operations related to users
 * @param {string} userName.path.required - Name of the user
 * @param {string} movieID.path.required - ID of the movie to add to favorites
 * @returns {string} 200 - Confirmation that the movie was removed
 * @returns {Error} 404 - User not found / movie not found in favorites
 * @returns {Error} 400 - favorite not found
 * @example Request:
 *     DELETE /users/John%20Doe/favorites/02
 * @example Response:
 *     "Movie 02 was removed from your favorites."
 */
app.delete('/users/:userName/favorites/:movieID', (req, res) => {
    let name = req.params.name;
    let movieID = req.params.movieID;

    // Find the user by name
    let user = users.find(function (user) {
        return user.name === name;
    });

    if (!user) {
        res.status(404).send('User with the name ' + name + ' was not found.');
        return;
    }

    // Check if user has movies already listed in favorites
    if (!user.favorites || user.favorites.length === 0) {
        res.status(400).send('User ' + name + ' has no favorite movies.');
        return;
    }

    // Check if the movie is in favorites
    if (!user.favorites.includes(movieID)) {
        res.status(404).send('Movie ' + movieID + ' is not in your favorites.');
        return;
    }

    // Remove the movie from favorites
    user.favorites = user.favorites.filter(function (id) {
        return id !== movieID;
    });

    res.status(200).send('Movie ' + movieID + ' was removed from your favorites.');
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