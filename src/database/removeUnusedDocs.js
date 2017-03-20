const scheduler = require('node-schedule');
const Assistant = require('../models/assistant');
// const mongoose = require('mongoose');

scheduler.scheduleJob({hour: 4, minute: 30, date: 1}, () =>{
  let date = new Date();
  date.setDate(date.getDate() - 90);
  let cutOff = date;
  Assistant.find({lastUpdate:{$lte:cutOff.toISOString()}}).lean().exec()
    .then( users => {
      users.forEach( user => {
        console.log(`User: ${user.username}, ${user.club} has been inactive for more than 90 days. Account will be removed in two weeks time.`);
      });
    })
    .catch( err => console.log(err));
});

scheduler.scheduleJob({hour: 4, minute: 30, date: 16}, () =>{
  let date = new Date();
  date.setDate(date.getDate() - 104);
  let cutOff = date;
  Assistant.find({lastUpdate:{$lte:cutOff.toISOString()}}).exec()
    .then( users => {
      users.forEach( user => {
        console.log(`User: ${user.username}, ${user.club} has been removed due to inactivity.`);
        user.remove();
      });
    })
    .catch( err => console.log(err));
});
