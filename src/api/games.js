'use strict';
const express = require('express');
const router = express.Router();
const Assistant = require('../models/assistant');
const mongoose = require('mongoose');

// Gets all the games for specific user.
router.get('/:id',(req,res,next)=>{
  let id = req.params.id;
  Assistant.findOne({username:id},(err,user)=>{
    if (err){
      return res.status(500).json({message: err.message});
    }
    else {
      res.json({games:user.games});
    }
  });
});

router.post('/',(req,res,next)=>{
  const {opponent,venue,date} = req.body;
  const game = {opponent,venue,date};
  const update = {$push:{games:game}};
  const option = {new:true};
  Assistant.findByIdAndUpdate(res.locals.decoded._id,update,option,(err,user)=>{
    if (err) {
      return res.status(500).json({success: false, message: err.message});
    } else {
      const {games} = user;
      res.json({success:true, games, message: 'Matchen lades till'});
    }
  });
});

router.put('/',(req,res,next)=>{
  req.body.game.ended = true;
  req.body.game.players.forEach( player => {
    player.minutes.total = player.minutes.out - player.minutes.in;
  });
  let find = {'games._id':mongoose.Types.ObjectId(req.body.game._id)};
  let update = {$set:{'games.$':req.body.game}};
  let option = {new:true};
  Assistant.findOneAndUpdate(find,update,option,(err,user)=>{
    if (err) {
      return res.status(500).json({success:false,message:err.message});
    } else {
      const {games} = user;
      const game = games.find( g => {
        return g._id.toString() === req.body.game._id.toString();
      });
      res.json({success:true,game,message:'Matchen sparades som avslutad'});
    }
  });
});

router.put('/sub',(req,res,next)=>{
  const {game,playerIn,playerOut,minute} = req.body;
  game.players.push(playerIn);
  game.players[game.players.length - 1].minutes = {in:minute,total:0,out:90};
  const subbedPlayer = game.players.find( player => player._id === playerOut);
  subbedPlayer.minutes.out = minute;
  let find = {'games._id':mongoose.Types.ObjectId(req.body.game._id)};
  let update = {$set:{'games.$':req.body.game}};
  let option = {new:true};
  Assistant.findOneAndUpdate(find,update,option,(err,user)=>{
    if (err) {
      return res.status(500).json({success:false,message:err.message});
    } else {
      const {games} = user;
      const game = games.find( g => {
        return g._id.toString() === req.body.game._id.toString();
      });
      res.json({success:true,game,message:'Matchen sparades som avslutad'});
    }
  });
});

router.put('/eleven',(req,res,next)=>{
  req.body.game.players = req.body.eleven;
  req.body.game.players.forEach(player => {
    player.minutes = {in:0,total:0,out:90};
  });
  let find = {'games._id':mongoose.Types.ObjectId(req.body.game._id)};
  let update = {$set:{'games.$':req.body.game}};
  let option = {new:true};
  Assistant.findOneAndUpdate(find,update,option,(err,user)=>{
    if (err) {
      return res.status(500).json({success:false,message:err.message});
    } else {
      const {games} = user;
      const game = games.find( g => {
        return g._id.toString() === req.body.game._id.toString();
      });
      res.json({success:true,game,message:'Startelvan sparades'});
    }
  });
});

// Deletes a subdocument with game for specific user.
router.delete('/:id/:user',(req,res,next)=>{
  let id = req.params.id;
  let user = req.params.user;
  let deleteItem = {$pull:{games:{_id: id}}};
  Assistant.update({username:user},deleteItem,(err,game)=>{
    if (err){
      return res.status(500).json({message: err.message});
    }
    else {
      res.json({message:'Deleted game'});
    }
  });
});

module.exports = router;