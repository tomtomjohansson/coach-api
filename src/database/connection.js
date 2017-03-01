'use strict';
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

// Connect to Mongo database
// const _internalConnectionPool = {};

// function connectToDatabase (url, database, options) {
//   const opts = Object.assign({}, {
//     server: {
//       poolSize: 5
//     }
//   }, options);

//   return new Promise(function (resolve, reject) {
//     const address = `mongodb://${url}/${database}`;
//     if (!(_internalConnectionPool[address])) {
//       try {
//         const conn = mongoose.connect(address, opts);
//         conn.on("open", function () {
//           console.log('Opened')
//           _internalConnectionPool[address] = conn;
//           resolve(_internalConnectionPool[address]);
//         });

//         conn.on("error", function (err) {
//           console.error("MongoDB error: %s", err);
//         });
//       } catch (err) {
//         reject(err);
//       }
//     } else {
//       return resolve(_internalConnectionPool[address]);
//     }
//   });
// }

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

// module.exports = connectToDatabase;