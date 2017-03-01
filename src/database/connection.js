'use strict';
const mongoose = require('mongoose');
const {serverUrl,database} = require('../settings');
const Promise = require('bluebird');
mongoose.Promise = Promise;

// Connect to database
mongoose.connect(`mongodb://${serverUrl}/${database}`)
.then(()=> console.log('Connected to database'))
.catch( err => console.log('Failed connecting to database: ',err));

// Close connection if server is shut down
process.on('SIGINT', ()=> {
  mongoose.connection.close( ()=> {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});
