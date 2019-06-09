var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');
const passport = require('passport');

const apiKey = 'ea5d381f3b7d65b85adef4d66fc9ef8c';
const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = `${apiBaseUrl}/movie/now_playing?api_key=${apiKey}`;
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';
const tempURL = 'https://api.themoviedb.org/3/movie/now_playing?api_key=ea5d381f3b7d65b85adef4d66fc9ef8c';

router.use((req, res, next) => {
  res.locals.imageBaseUrl = imageBaseUrl;
  next();
})

router.get('/', async (req, res, next) => {
  try {
    console.log(req.user);
    const fetchedAPI = await fetch(tempURL);
    const parsedData = await fetchedAPI.json();
    

    res.render('index', {
      parsedData: parsedData.results
    })
  }
  catch (e) {
    console.log(e);
  }
});

router.get('/movie/:id', async (req, res, next) => {
  const movieId = req.params.id;
  const thisMovieUrl = `${apiBaseUrl}/movie/${movieId}?api_key=ea5d381f3b7d65b85adef4d66fc9ef8c`;
  const fetchedMovie = await fetch(thisMovieUrl);
  const parsedData = await fetchedMovie.json();
  res.render('single-movie', {
    parsedData
  })
});

router.get('/login', passport.authenticate('github'));

router.get('/auth', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect: '/loginFailed'
}));

router.get('/favorites', (req, res) => {
  res.json(req.user.username);
});

router.post('/search', async (req, res, next) => {
  const userSearchTerm = req.body.movieSearch;
  const cat = req.body.cat;
  const movieUrl = `${apiBaseUrl}/search/${cat}?query=${encodeURI(userSearchTerm)}&api_key=ea5d381f3b7d65b85adef4d66fc9ef8c`;
  
  const fetchedData = await fetch(movieUrl);
  let parsedData = await fetchedData.json();

  if (cat == "person") {
    parsedData.results = parsedData.results[0].known_for;
  }

  res.render('index', {
    parsedData: parsedData.results
  });
});
module.exports = router;
