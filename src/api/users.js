'use strict';
const express = require('express');
const router = express.Router();
const Assistant = require('../models/assistant');
const passport = require('passport');

// Gets request body from registration. Saves new user to database
router.post('/register', function(req, res, next){
  const {username,club,password,email} = req.body;
  if (!username || !password || !email || !club){
    return res.status(400).json({success: false, message: 'Var god fyll i alla fälten'});
  }
  Assistant.count({username:username}, (err,c)=>{
    if (err) {
      return res.status(500).json({success: false, message: err.message});
    } else {
      if (c) {
        return res.status(400).json({success: false, message: 'Användarnamnet är upptaget.'});
      } else {
        next();
      }
    }
  });
});

router.post('/register', function(req, res, next){
  const {username,club,password,email} = req.body;
  var assistant = new Assistant();
  assistant = Object.assign(assistant,{username,club,email});
  assistant.setPassword(password);
  assistant.save( (err,user) =>{
    if (err){
      return res.json({sucess:false});
    } else {
      var token = user.generateJWT();
      return res.json({
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
        token: token
      });
    }
  });
});

// Logs in the user. Returns user and webtoken
router.post('/login', function(req, res, next){
  if (!req.body.username || !req.body.password){
    return res.status(400).json({success: false, message: 'Var god fyll i alla fälten'});
  }
  passport.authenticate('local', function(err, user, info){
    if (err){
      return res.json({success:false});
    }
    if (user){
      var token = user.generateJWT();
      return res.json({
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
        token: token
      });
    }
    else {
      return res.status(401).json({success:false, message: info.message});
    }
  })(req, res, next);
});

module.exports = router;
