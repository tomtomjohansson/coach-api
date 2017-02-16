'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Connect to Mongo database
// mongoose.connect('mongodb://127.0.0.1/assistant', (err)=>{
mongoose.connect('mongodb://localhost/assistant', (err)=>{
  if (err) {
    console.log('Failed connecting to database');
  }
  else {
    console.log('Connected to database');
  }
});
// Close connection if server is shut down
process.on('SIGINT', ()=> {
  mongoose.connection.close( ()=> {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});
