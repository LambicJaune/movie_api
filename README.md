# myTomHanksApp

## 📽️ About the Project

**myTomHanksApp** is a full-stack movie web application that allows users to browse and explore movies featuring Tom Hanks. It consists of:

-   A **RESTful backend API** built with Node.js, Express, and MongoDB.
-   A **React-based frontend client** that connects to the API and provides a rich, responsive user interface.
-   Features include user registration, login, secure token-based authentication, movie filtering, favorites management, and user profile updates.

---

## 🔧 Backend (API)

### Features

-   User registration & authentication using JWT
-   Token-protected routes
-   Get movies by title, genre, or director
-   View detailed director information
-   Add/remove favorite movies
-   Create, update, and delete user accounts

### Tech Stack

-   Node.js
-   Express
-   MongoDB + Mongoose
-   Passport.js (JWT Authentication)
-   bcrypt (Password Hashing)
-   express-validator
-   CORS
-   Morgan (Logging)

### Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/LambicJaune/movie_api.git
    cd movie_api
    ```

### Install dependencies through the terminal:

npm install

### Database Setup (MongoDB Atlas)

1. Go to MongoDB Atlas.

2. Create a cluster and a new database (e.g., TomHanksAppDB).

3. Add a database user and whitelist your IP address (or allow 0.0.0.0/0).

4. Create your collections (e.g., movies, users).

5. Add a .env file in your project root: MONGO_URI=mongodb+srv://<username>:<password>@<cluster-address>/<database-name>?retryWrites=true&w=majority&appName=<your-app-name>

### Running the Backend :

npm start (Or, for development: npx nodemon index.js)

### The API runs locally at:

http://localhost:8080

Use Postman or curl to test your endpoints.

🎬 Frontend (Client)

The client is a React Single Page Application (SPA) that allows users to log in, browse movies, apply filters (genre or director), search a movie by title, manage favorites, and update/delete their profile.

### Features:

-Responsive design using React-Bootstrap

-Search movies by title

-Filter by genre or director (mutually exclusive)

-Token-based authentication and protected routes

-View movie and director details

-Add/remove favorites

-Update user profile and deregister

-State management using Redux Toolkit

### Tech Stack:

React 19

Redux Toolkit

React Router DOM

React-Bootstrap + Bootstrap 5

PropTypes

Parcel (for bundling)

SASS (via Parcel transformer)

### Installation :

1. Nevigate to the client's folder :

cd mythomhanksapp-client

2. Install dependencies :

npm install

### Running the Frontend :

npm start

This runs the app on:
http://localhost:1234 (default Parcel port)

Author & License
Author: LambicJaune (Gael Giraud)

License: ISC

GitHub Repo: https://github.com/LambicJaune/myTomHanksApp-client/
