const jwtSecret = 'your_jwt_secret'; //Same key used in JWTStrategy of the passport.js file

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport'); // local passport file

let generateJWTToken = (user) => {
    return jwt.sign({ _id: user._id, Username: user.Username }, jwtSecret, {
        subject: user.Username, // username encoded in the JWT
        expiresIn: '7d', // 7 days expiration date for the token
        algorithm: 'HS256' // Algorithm used to "sign" or encode the values of the JWT
    });
}

/*POST login*/
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        })(req, res);
    });
}