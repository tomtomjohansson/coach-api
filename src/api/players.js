'use strict';
const express = require('express');
const router = express.Router();
const Assistant = require('../models/assistant');
const mongoose = require('mongoose');

// Finds all players of specific user.
router.post('/',(req,res,next)=>{
  Assistant.findOne({username:res.locals.decoded.username},(err,user)=>{
    if (err){
      return res.status(500).json({message: err.message});
    }
    else {
      res.json({players:user.players});
    }
  });
});

// Adds subdocument with new player.
router.post('/add',(req,res,next)=>{
  let player = {name:req.body.name,phone:req.body.phone};
  let update = {$push:{players:player}};
  let option = {new:true};
  Assistant.findByIdAndUpdate(res.locals.decoded._id,update,option,(err,user)=>{
    if (err){
      return res.status(500).json({success: false, message: err.message});
    }
    else {
      const players = user.players;
      res.json({success: true, players: players, message:'Spelaren lades till'});
    }
  });
});

// Deletes subdocument of player.
router.delete('/:id',(req,res,next)=>{
  let id = req.params.id;
  let deleteItem = {$pull:{players:{_id: id}}};
  Assistant.findByIdAndUpdate(res.locals.decoded._id,deleteItem,(err,user)=>{
    if (err){
      return res.status(500).json({success: false, message: err.message});
    }
    else {
      res.json({success: true, message:'Spelaren raderades'});
    }
  });
});

module.exports = router;
