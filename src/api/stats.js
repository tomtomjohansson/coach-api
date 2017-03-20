'use strict';
const express = require('express');
const router = express.Router();
const Assistant = require('../models/assistant');
const mongoose = require('mongoose');

// Gets stats from games for player pages.
// 1. Selects only the games where the player participates.
// 2. For every game, make an object in an array.
// 3. Selects only the players key from those games.
// 4. For every player participating in those games make object in array.
// 5. Picks out only instances of desired player from array.
// 6. Grouping. Selects all the stats desired and makes calculations.
// 7. Final project. Calculates those instances from group-stage that needed further work.
router.get('/playerStats/game/:playerID',(req,res,next)=>{
  Assistant.aggregate([
  {$match:{_id:mongoose.Types.ObjectId(res.locals.decoded.sub)}},
  {$match:{'games.players._id':mongoose.Types.ObjectId(req.params.playerID)}},//Check if match ended
  {$unwind:'$games'},
  {$project:{'player':'$games.players'}},
  {$unwind:'$player'},
  {$match:{'player._id':mongoose.Types.ObjectId(req.params.playerID)}},
  {$group:{_id:'stats',games:{$sum:{$cond:[{$gt:['$player.minutes.total',0]},1,0]}},gamesStarted:{$sum:{$cond:[{$and:[{$gt:['$player.minutes.total',0]},{$eq:['$player.minutes.in',0]}]},1,0]}},gamesAsSub:{$sum:{$cond:[{$and:[{$gt:['$player.minutes.total',0]},{$ne:['$player.minutes.in',0]}]},1,0]}},goals:{$sum:'$player.goals'},shots:{$sum:'$player.shots'},assists:{$sum:'$player.assists'},yellow:{$sum:'$player.yellow'},red:{$sum:'$player.red'},name:{$first:'$player.name'},totalMinutes:{$sum:'$player.minutes.total'}}},
  {$project:{stats:1,name:1,games:1,gamesStarted:1,gamesAsSub:1,goals:1,shots:1,assists:1,yellow:1,red:1,totalMinutes:1,goalsAvg:{$cond:[{$eq:[ '$games', 0 ]},0,{$divide:['$goals', '$games']}]},shotsAvg:{$cond:[{$eq:[ '$games', 0 ]},0,{$divide:['$shots', '$games']}]},minutesPerGame:{$cond:[{$eq:[ '$games', 0 ]},0,{$divide:['$totalMinutes', '$games']}]},minutesPerGoal:{$cond:[{$eq:[ '$goals', 0 ]},'N/A',{$divide:['$totalMinutes', '$goals']}]},goalOnShotsAvg:{$cond:[{$eq:[ '$goals', 0 ]},0,{$divide:['$goals', '$shots']}]}}}
  ]).exec()
    .then( player => res.status(200).json({success:true, playerStats:player}))
    .catch( err => res.status(500).json({success:false,message: err.message}));
});

// Gets stats from training for player pages.
// 1. Only selects player subdocuments.
// 2. Makes array of objects for every subdocuments.
// 3. Matches only instances of desired player from array.
// 4. Makes calculations from those stats.
router.get('/playerStats/training/:playerID/',(req,res,next)=>{
  Assistant.aggregate([
  {$match:{_id:mongoose.Types.ObjectId(res.locals.decoded.sub)}},
  {$match:{'_id':mongoose.Types.ObjectId(res.locals.decoded.sub)}},
  {$unwind:'$trainings'},
  {$sort:{'trainings.date':1}},
  {$project:{trainings:1, attending:{$size:'$trainings.attending'}}},
  {$match:{'attending':{$gte:1}}},
  {$project:{attending:{$in:[req.params.playerID,'$trainings.attending']}}}
  ]).exec()
    .then( trainer => res.status(200).json({success:true, playerStats:trainer}))
    .catch( err => res.status(500).json({success:false, message: err.message}));
});

// Gets stats from games for team page.
// 1. Points out the user.
// 2. Selects only the club key and the games key.
// 3. Make array with object for every game.
// 4. Only select games that have ended (not forthcoming games).
// 5. Specifies which keys are interesting.
// 6. Grouping. Selects all the stats desired and makes calculations.
router.get('/teamStats/:sortOn',(req,res,next)=>{
  let sorted = {};
  if (req.params.sortOn === 'all') {
    sorted = {$match:{'games.ended':true}};
  }  else if (req.params.sortOn === 'home') {
    sorted = {$match:{'games.ended':true,'games.venue':'Hemma'}};
  } else if (req.params.sortOn === 'away'){
    sorted = {$match:{'games.ended':true,'games.venue':'Borta'}};
  }
  Assistant.aggregate([
  {$match:{'_id':mongoose.Types.ObjectId(res.locals.decoded.sub)}},
  {$project:{club:1,games:1}},
  {$unwind:'$games'},
  sorted,
  {$project:{club:1,'games.goals':1,'games.shots':1,'games.corners':1,'games.yellow':1,'games.red':1}},
  {$group:{_id:'statsForTeam',wins:{$sum:{$cond:[{$gt:['$games.goals.for','$games.goals.against']},1,0]}},losses:{$sum:{$cond:[{$lt:['$games.goals.for','$games.goals.against']},1,0]}},draws:{$sum:{$cond:[{$eq:['$games.goals.for','$games.goals.against']},1,0]}},count:{$sum:1},club:{$first:'$club'},totalGoalsFor:{$sum:'$games.goals.for'},totalGoalsAgainst:{$sum:'$games.goals.against'},totalShotsFor:{$sum:'$games.shots.for'},totalShotsAgainst:{$sum:'$games.shots.against'},avgGoalsFor:{$avg:'$games.goals.for'},avgGoalsAgainst:{$avg:'$games.goals.against'},avgShotsFor:{$avg:'$games.shots.for'},avgShotsAgainst:{$avg:'$games.shots.against'},avgCornerFor:{$avg:'$games.corners.for'},avgCornerAgainst:{$avg:'$games.corners.against'},avgYellowFor:{$avg:'$games.yellow.for'},avgRedFor:{$avg:'$games.red.for'}}},
  {$project:{club:1,wins:1,losses:1,draws:1,count:1,totalGoalsFor:1,totalGoalsAgainst:1,avgGoalsFor:1,avgGoalsAgainst:1,avgShotsFor:1,avgShotsAgainst:1,avgCornerFor:1,avgCornerAgainst:1,avgYellowFor:1,avgRedFor:1,shotConversionFor:{$cond:[{$eq:[ '$totalShotsFor', 0 ]},0,{$divide:['$totalGoalsFor', '$totalShotsFor']}]},shotConversionAgainst:{$cond:[{$eq:[ '$totalShotsAgainst', 0 ]},0,{$divide:['$totalGoalsAgainst', '$totalShotsAgainst']}]}}}
  ]).exec()
    .then( team => {
      Assistant.aggregate([
        {$match:{'_id':mongoose.Types.ObjectId(res.locals.decoded.sub)}},
        {$project:{trainings:1}},
        {$unwind:'$trainings'},
        {$group:{_id:'trainings',avgAttendance:{$avg:'$trainings.attendance'}}}
      ]).exec()
      .then( training => res.status(200).json({success:true,team,training}))
      .catch( err => res.status(500).json({success:false,message: err.message}));
    })
    .catch( err => res.status(500).json({success:false,message: err.message}));
});

module.exports = router;

// db.assistants.aggregate([
//   {$match:{_id:ObjectId("58a5a255f56e33047e5922ff")}},
//   {$match:{'games.players._id':ObjectId("58a5a2b8f56e33047e592301")}},//Check if match ended
//   {$unwind:'$games'},
//   {$project:{'player':'$games.players'}},
//   {$unwind:'$player'},
//   {$match:{'player._id':ObjectId("58a5a2b8f56e33047e592301")}},
//   {$group:{_id:'stats',games:{$sum:{$cond:[{$gt:['$player.minutes.total',0]},1,0]}},gamesStarted:{$sum:{$cond:[{$and:[{$gt:['$player.minutes.total',0]},{$eq:['$player.minutes.in',0]}]},1,0]}},gamesAsSub:{$sum:{$cond:[{$and:[{$gt:['$player.minutes.total',0]},{$ne:['$player.minutes.in',0]}]},1,0]}},goals:{$sum:'$player.goals'},shots:{$sum:'$player.shots'},assists:{$sum:'$player.assists'},yellow:{$sum:'$player.yellow'},red:{$sum:'$player.red'},name:{$first:'$player.name'},totalMinutes:{$sum:'$player.minutes.total'}}},
//   {$project:{stats:1,name:1,games:1,gamesStarted:1,gamesAsSub:1,goals:1,shots:1,assists:1,yellow:1,red:1,totalMinutes:1,goalsAvg:{$cond:[{$eq:[ '$games', 0 ]},0,{$divide:['$goals', '$games']}]},shotsAvg:{$cond:[{$eq:[ '$games', 0 ]},0,{$divide:['$shots', '$games']}]},minutesPerGame:{$cond:[{$eq:[ '$games', 0 ]},0,{$divide:['$totalMinutes', '$games']}]},minutesPerGoal:{$cond:[{$eq:[ '$goals', 0 ]},'N/A',{$divide:['$totalMinutes', '$goals']}]},goalOnShotsAvg:{$cond:[{$eq:[ '$goals', 0 ]},0,{$divide:['$goals', '$shots']}]}}}
//   ],{explain:true})