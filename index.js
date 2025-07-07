const mongoose = require('mongoose');
const Models = require('./models/models.js');

mongoose.connect('mongodb://localhost:27017/TomHanksAppDB');

const express = require('express'),
    app = express(),
    //logging middleware
    morgan = require('morgan');

//imports body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
            let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

//import auth.js file (creates new endpoint for registered users to login)
let auth = require('./auth')(app);

//requires the Passport module and import the "passport.js" file
const passport = require('passport');
require('./passport');

app.use(morgan('common'));

//send static files from the "public" directory
app.use(express.static('public'));

// Import routers for movies and users
const moviesRouter = require('./routes/movies');
const usersRouter = require('./routes/users');

// Use routers with base paths
app.use('/movies', moviesRouter);// Movies routes handle their own authentication
app.use('/users', usersRouter); // Users routes handle their own authentication

// GET root endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Tom Hanks app!');
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
