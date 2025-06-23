const express = require('express'),
    app = express(),
    //logging middleware
    morgan = require('morgan');

let topMovies = [
  {
    title: 'Forrest Gump',
    director: 'Robert Zemeckis'
  },
  {
    title: 'The Green Mile',
    director: 'Frank Darabont'
  },
    {
    title: 'Cast Away',
    director: 'Robert Zemeckis'
  },
    {
    title: 'Philadelphia',
    director: 'Jonathan Demme'
  },
  {
    title: 'Road to Perdition',
    director: 'Sam Mendes'
  },
  {
    title: 'Catch Me If You Can',
    director: 'Steven Spielberg'
  },
  {
    title: 'The Terminal',
    director: 'Steven Spielberg'
  },
  {
    title: 'The Da Vinci Code',
    director: 'Ron Howard'
  },
  {
    title: 'Big',
    director: 'Penny Marshall'
  },
   {
    title: 'Sully',
    director: 'Clint Eastwood'
  }
];

app.use(morgan('common'));

//send static files from the "public" directory
app.use(express.static('public'));

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to the Tom Hanks app!');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});