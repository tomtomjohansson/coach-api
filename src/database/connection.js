'use strict';
const mongoose = require('mongoose');
const {devUrl,prodUrl} = require('../settings');
const Promise = require('bluebird');
mongoose.Promise = Promise;

// Connect to database
mongoose.connect(process.env.NODE_ENV === 'development' ? devUrl : prodUrl)
.then(()=> console.log('Connected to database'))
.catch( err => console.log('Failed connecting to database: ',err));

// Close connection if server is shut down
process.on('SIGINT', ()=> {
  mongoose.connection.close( ()=> {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});
