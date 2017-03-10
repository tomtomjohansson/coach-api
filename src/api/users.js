'use strict';
const express = require('express');
const router = express.Router();
const Assistant = require('../models/assistant');
const Login = require('../models/login');
const passport = require('passport');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const {loginSchema,registrationSchema} = require('../validation/userValidation');

// Gets request body from registration. Saves new user to database
router.post('/register', function(req, res, next){
  const {username,club,password,email} = req.body;
  if (!username || !password || !email || !club){
    return res.status(400).json({success: false, message: 'Var god fyll i alla fälten'});
  }
  req.checkBody(registrationSchema);
    const errors = req.validationErrors();
    if (errors) {
      return res.status(401).json({success:false,message:errors[0].msg});
    }
  Assistant.count({username:username})
  .then( c => {
    if (c) {
      return res.status(400).json({success: false, message: 'Användarnamnet är upptaget.'});
    } else {
      next();
    }
  })
  .catch( err => next(err));
});

router.post('/register', (req, res, next) => {
  const {username,club,password,email} = req.body;
  res.locals.assistant = new Assistant();
  res.locals.assistant = Object.assign(res.locals.assistant,{username,club,email});
  res.locals.assistant.setPassword(password,next);
});

router.post('/register', (req, res, next) => {
  res.locals.assistant.save()
    .then( user => res.status(200).json(createUserObject(user)))
    .catch( err => next(err));
},(err,req,res,next) => res.status(500).json({sucess:false, message: err.message }));

// Logs in the user. Returns user and webtoken
router.post('/login', (req, res, next) => {
  const {username, password} = req.body;
  if (!username || !password){
    return res.status(401).json({success: false, message: 'Var god fyll i alla fälten'});
  }
  req.checkBody(loginSchema);
    const errors = req.validationErrors();
    if (errors) {
      return res.status(401).json({success:false,message:errors[0].msg});
    }
  Assistant.count({username:username})
    .then( c => {
      if (!c) {
        return res.status(401).json({success: false, message: 'Vi hittade inget konto med det användarnamnet.'});
      } else {
        next();
      }
    })
    .catch( err => next(err));
});

router.post('/login', (req,res,next) => {
  res.locals.delayResponse = response => {
    setTimeout(() => {
      response();
    }, 500);
  };
  res.locals.identityKey = `${req.body.username}-${req.ip}`;
  Login.inProgress(res.locals.identityKey)
    .then( inProgress => inProgress ? res.locals.delayResponse(() => res.status(401).json({success:false, message: 'Ett login-försök pågår redan.'})) : next())
    .catch( err => next(err));
});

router.post('/login', (req,res,next) => {
  Login.canAuthenticate(res.locals.identityKey)
    .then( isNotLocked => isNotLocked ? next() : res.locals.delayResponse(() => res.status(500).json({success:false,message:'Kontot är låst efter för många felaktiga försök att logga in. Var god försök igen senare.'})))
    .catch( err => next(err));
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err){
      next(err);
    } else if (user){
      Login.successfulLoginAttempt(res.locals.identityKey);
      return res.locals.delayResponse( () => res.status(200).json(createUserObject(user)));
    } else {
      Login.failedLoginAttempt(res.locals.identityKey);
      return res.locals.delayResponse( () => res.status(401).json({success:false, message: info.message}));
    }
  })(req, res, next);
  }, (err,req,res,next) => {
    res.locals.delayResponse(() => res.status(500).json({sucess:false, message: err.message }));
});


function createUserObject(user){
  return {
    success: true,
    user: {
      username: user.username,
      club: user.club,
      id: user._id,
      email: user.email,
      teamColors: user.teamColors
    },
    players: user.players,
    trainings: user.trainings,
    games: user.games,
    token: user.generateJWT()
  };
}

module.exports = router;
