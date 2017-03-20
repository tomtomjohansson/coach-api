'use strict';
// Express/environment dependencies
const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const parser = require('body-parser');
const validator = require('express-validator');
const compression = require('compression');
const helmet = require('helmet');
// Database & authentication
process.env.NODE_ENV !== 'production' && require('./src/database/backupHandler');
require('./src/database/removeUnusedDocs');
require('./src/models/assistant');
require('./src/database/connection');
require('./src/passport/passport');
// API
const stats = require('./src/api/stats');
const users = require('./src/api/users');
const games = require('./src/api/games');
const trainings = require('./src/api/trainings');
const players = require('./src/api/players');
// Misc Dependencies
const PORT = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');
const bearer = require('parse-bearer-token');

app.use(helmet());
app.use(parser.json());
app.use(validator());
app.use(compression());

// Sets up routes
app.use('/api/authenticate', users);
// Checks for access to api
app.use('/api',(req,res,next) => {
  const token = bearer(req);
  try {
    const decoded = jwt.verify(token,process.env.SECRET);
    res.locals.decoded = decoded;
    next();
  }
  catch (e) {
    res.status(401).json({success: false, message: 'Du måste vara inloggad för att genomföra åtgärden.'});
  }
});
app.use('/api', stats);
app.use('/api/games', games);
app.use('/api/trainings', trainings);
app.use('/api/players', players);
app.use((req, res, next) => {
  res.status(404).json({success:false,message:'Servern kunde inte hitta önskad url.'});
});

app.listen(PORT, err => {
  if (err){
    console.log('Failed to connect');
  }
  else {
    console.log('Connected to server ' + PORT);
  }
});
