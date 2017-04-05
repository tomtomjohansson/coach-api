'use strict';
const express = require('express');
const router = express.Router();
const Assistant = require('../models/assistant');
const mongoose = require('mongoose');
const {addGameSchema, substitutionSchema} = require('../validation/userValidation');

// Gets all the games for specific user.
router.get('/', (req,res,next) => {
  Assistant.findById(res.loacals.decoded.sub,{},{select:{games:1}}).lean().exec()
    .then( user => res.status(200).json({success: true, games:user.games}))
    .catch( err => res.status(500).json({success: false, message: err.message}));
});

router.post('/',(req,res,next)=>{
  req.checkBody(addGameSchema);
    const errors = req.validationErrors();
    if (errors) {
      return res.status(500).json({success:false,message:errors[0].msg});
    }
  const {opponent,venue,date} = req.body;
  const game = {opponent,venue,date};
  const update = {$push:{games:game},$set:{lastUpdate:Date.now()}};
  const option = {new:true, select:{games:1}};
  Assistant.findByIdAndUpdate(res.locals.decoded.sub,update,option).lean().exec()
    .then( user => res.status(201).json({success:true, games: user.games , message: 'Matchen lades till'}))
    .catch( err => res.status(500).json({success: false, message: err.message}));
});

router.put('/',(req,res,next)=>{
  req.body.game.ended = true;
  req.body.game.players.forEach( player => {
    if (player.minutes.played.length > 0) {
      if (player.minutes.played.length % 2 !== 0) {
        player.minutes.played.push(90);
      }
      for (let i = 0; i < player.minutes.played.length; i += 2) {
        player.minutes.total += (player.minutes.played[i + 1] - player.minutes.played[i]);
      }
    }
  });
  res.locals.message = 'Matchen sparades som avslutad';
  next();
});

router.put('/sub',(req,res,next) => {
  req.checkBody(substitutionSchema);
    const errors = req.validationErrors();
    if (errors) {
      return res.status(500).json({success:false,message:errors[0].msg});
    }
  const {game,playerIn,playerOut,minute} = req.body;
  const enteringPlayer = game.players.find( player => player._id === playerIn);
  const subbedPlayer = game.players.find( player => player._id === playerOut);
  subbedPlayer.minutes.played.push(minute);
  enteringPlayer.minutes.played.push(minute);
  // enteringPlayer.position = subbedPlayer.position;
  // subbedPlayer.position = 'BENCH';
  res.locals.message = 'Bytet genomfördes';
  next();
});

router.put('/eleven',(req,res,next) => {
  req.body.game.players = [...req.body.eleven,...req.body.bench];
   req.body.game.players.forEach(player => {
    player.minutes = {
      played: [],
      total: 0
    };
    if (player.position !== 'BENCH') {
      player.minutes.played.push(0);
    }
  });
  req.body.game.formation = req.body.formation;
  res.locals.message = 'Startelvan sparades';
  next();
});

router.put('*', (req,res,next) => {
  const find = {'games._id':mongoose.Types.ObjectId(req.body.game._id)};
  const update = {$set:{'games.$':req.body.game,lastUpdate:Date.now()}};
  const option = {new:true,select:{games:1}};
  Assistant.findOneAndUpdate(find,update,option).lean().exec()
    .then( user => {
      const game = user.games.find( g => g._id.toString() === req.body.game._id.toString());
      res.status(200).json({success:true,game,message:res.locals.message});
    })
    .catch( err => res.status(500).json({success:false,message:err.message}));
});

// Deletes a subdocument with game for specific user.
router.delete('/:id',(req,res,next)=>{
  let id = req.params.id;
  let deleteItem = {$pull:{games:{_id: id}}};
  const option = {new:true,select:{games:1}};
  Assistant.findByIdAndUpdate(res.locals.decoded.sub,deleteItem,option).lean().exec()
    .then( user => res.status(200).json({success: true, message:'Deleted game'}))
    .catch( err => res.status(500).json({success:false, message: err.message}));
});

module.exports = router;
