<h1>my TomHanks App<h1>
<br>
<h3>About the project :</h3>

This is a RESTful API built with Node.js, Express, and MongoDB that allows users to register, log in, and access information about movies starring or including Tom Hanks, their genres, and directors. It includes secure user authentication and data validation.

Features :

- User registration & authentication (JWT)

- Protected routes with token-based access

- Get movies by title, genre, director

- Get data about a director

- Create, update, delete users


Tech stack:

- Node.js

- Express

- MongoDB + Mongoose

- Passport.js (JWT authentication)

- bcrypt (password hashing)

- express-validator

- CORS

- Morgan (logging)

<h3>Installation :</h3>

1. Clone the repository:

git clone https://github.com/LambicJaune/movie_api.git
cd movie_api

2. Install Dependencies:

npm install

<h3>Database Setup :</h3>

This project uses MongoDB Atlas as a cloud database.

1. Create a MongoDB Atlas Account
Go to MongoDB Atlas.

Create a free cluster.

Add a new database user (username & password).

Under Network Access, whitelist your current IP address or allow access from anywhere (0.0.0.0/0).

2. Create a Database
Name it for example: TomHanksAppDB.

Create your collections (e.g., movies, users).

3. Add Your Database Connection in an Environment Variable
Create a .env file in the project root (this file should not be committed to GitHub):

MONGO_URI=mongodb+srv://<username>:<password>@<cluster-address>/<database-name>?retryWrites=true&w=majority&appName=<your-app-name>

<h3>Running the project :</h3>

1. Start the API Locally

npm start (or during development with automatic restarts on changes: npx nodemon index.js)

2. The API will be available at http://localhost:8080

You can use tools like Postman or curl to test your endpoints.