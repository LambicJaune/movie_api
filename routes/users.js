const express = require('express');
const router = express.Router();
const Models = require('../models/models.js');
const Users = Models.User;
const lodash = require('lodash');
const passport = require('passport');
const { check, validationResult } = require('express-validator');

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
router.post(
  '/',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Password', 'Password cannot contain spaces').matches(/^\S+$/),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const existingUsername = await Users.findOne({ Username: req.body.Username });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const existingEmail = await Users.findOne({ Email: req.body.Email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email address is already taken' });
      }

      const hashedPassword = Users.hashPassword(req.body.Password);

      const newUser = await Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      });

      const userResponse = lodash.pick(newUser.toObject(), ['Username', 'Email', 'Birthday']);
      return res.status(201).json(userResponse);

    } catch (error) {
      console.error(error);
      return res.status(500).send('Error: ' + error);
    }
  }
);

/**
 * Get a user by username
 * @route GET /users/:userName
 * @group Users - Operations related to users
 * @returns {object} 200 - The user object
 * @returns {Error} 404 - User not found
 */
router.get('/:userName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.Username !== req.params.userName) {
    return res.status(403).send('You are not authorized to access this user');
  }

  try {
    const user = await Users.findOne({ Username: req.params.userName });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
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
router.put('/:userName', passport.authenticate('jwt', { session: false }),
    // Validation logic here for request
    //you can either use a chain of methods like .not().isEmpty()
    //which means "opposite of isEmpty" in plain english "is not empty"
    //or use .isLength({min: 5}) which means
    //minimum value of 5 characters are only allowed
    [
        check('Username', 'Username is required').isLength({ min: 5 }),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], async (req, res) => {

        // check the validation object for errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        // condition to make sure that the username in the request body matches the one in the request parameter
        if (req.user.Username !== req.params.userName) {
            return res.status(400).send('Permission denied');
        } //end of the condition 
        await Users.findOneAndUpdate({ Username: req.params.userName }, {
            $set:
            {
                Username: req.body.Username,
                Password: Users.hashPassword(req.body.Password),
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
router.post('/:userName/favorites/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
router.delete('/:userName/favorites/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
router.delete('/:userName', passport.authenticate('jwt', { session: false }), async (req, res) => {
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

module.exports = router;
