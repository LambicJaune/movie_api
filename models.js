const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let movieSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: {
        name: String,
        description: String
    },
    director: {
        name: String,
        bio: String,
        birth: String,
        death: String
    },
    imagePath: String,
    featured: Boolean
});

let userSchema = mongoose.Schema({
    Username: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Birthday: Date,
    FavoriteMovies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;