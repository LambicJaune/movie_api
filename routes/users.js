const express = require('express');
const router = express.Router();
const Models = require('../models/models.js');
const Users = Models.User;
const lodash = require('lodash');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

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

        // Remove password before sending response
        const userResponse = lodash.omit(user.toObject(), ['Password']);
        res.json(userResponse);

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
router.put(
    '/:userName',
    passport.authenticate('jwt', { session: false }),
    [
        check('Username').optional().isLength({ min: 5 }).withMessage('Username too short')
            .isAlphanumeric().withMessage('Username must be alphanumeric'),
        check('Password').optional().matches(/^\S+$/).withMessage('Password cannot contain spaces'),
        check('Email').optional().isEmail().withMessage('Invalid email'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

        try {
            // Ensure logged-in user is editing their own account
            if (req.user.Username !== req.params.userName) {
                return res.status(403).json({ message: 'You can only update your own account' });
            }

            const updateData = {};
            if (req.body.Username) updateData.Username = req.body.Username;
            if (req.body.Password) updateData.Password = Users.hashPassword(req.body.Password);
            if (req.body.Email) updateData.Email = req.body.Email;
            if (req.body.Birthday) updateData.Birthday = req.body.Birthday;

            console.log('Updating user:', req.params.userName, 'with data:', updateData);

            // Check if username update is requested and the new username is already taken
            if (updateData.Username) {
                const existingUser = await Users.findOne({ Username: updateData.Username });
                if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
                    return res.status(400).json({ message: 'Username already exists' });
                }
            }

            const updatedUser = await Users.findByIdAndUpdate(
                req.user._id,         // Always update by _id, never by username
                { $set: updateData },
                { new: true, runValidators: true }
            );

            console.log('Updated user:', updatedUser);

            if (!updatedUser) return res.status(404).json({ message: 'User not found' });

            // Remove password before sending response
            const updatedUserResponse = lodash.omit(updatedUser.toObject(), ['Password']);

            // generate new JWT
            const token = jwt.sign(
                { Username: updatedUserResponse.Username },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(200).json({ user: updatedUserResponse, token });

        } catch (err) {
            console.error('PUT /users/:userName error:', err);
            return res.status(500).json({ message: err.message, stack: err.stack });
        }
    }
);




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
