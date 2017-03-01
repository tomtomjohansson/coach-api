'use strict';
const express = require('express');
const router = express.Router();
const Assistant = require('../models/assistant');
const passport = require('passport');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

// Gets request body from registration. Saves new user to database
router.post('/register', function(req, res, next){
  const {username,club,password,email} = req.body;
  if (!username || !password || !email || !club){
    return res.status(400).json({success: false, message: 'Var god fyll i alla fälten'});
  }
  Assistant.count({username:username})
  .then( c => {
    if (c) {
      return res.status(400).json({success: false, message: 'Användarnamnet är upptaget.'});
    } else {
      next();
    }
  })
  .catch( err => res.status(500).json({success: false, message: err.message}));
});

router.post('/register', function(req, res, next){
  const {username,club,password,email} = req.body;
  var assistant = new Assistant();
  assistant = Object.assign(assistant,{username,club,email});
  assistant.setPassword(password);
  assistant.save()
  .then( user => res.status(200).json(createUserObject(user)))
  .catch( err => res.status(500).json({sucess:false, message: err.message}));
});

// Logs in the user. Returns user and webtoken
router.post('/login', function(req, res, next){
  if (!req.body.username || !req.body.password){
    return res.status(401).json({success: false, message: 'Var god fyll i alla fälten'});
  }
  passport.authenticate('local', (err, user, info) => {
    if (err){
      return res.json({success:false});
    } else if (user){
      return res.status(200).json(createUserObject(user));
    } else {
      return res.status(401).json({success:false, message: info.message});
    }
  })(req, res, next);
});


function createUserObject(user){
  return {
    success: true,
    user: {
      username: user.username,
      club: user.club,
      id: user._id,
      email: user.email
    },
    players: user.players,
    trainings: user.trainings,
    games: user.games,
    token: user.generateJWT()
  };
}

module.exports = router;
