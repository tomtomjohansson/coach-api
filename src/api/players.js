'use strict';
const express = require('express');
const router = express.Router();
const Assistant = require('../models/assistant');

// Adds subdocument with new player.
router.post('/',(req,res,next)=>{
  let player = {name:req.body.name,phone:req.body.phone};
  let update = {$push:{players:player}};
  let option = {new:true};
  Assistant.findByIdAndUpdate(res.locals.decoded.sub,update,option).lean().exec()
    .then( user => res.status(201).json({success: true, players: user.players, message:'Spelaren lades till'}))
    .catch(err => res.status(500).json({success: false, message: err.message}));
});

// Deletes subdocument of player.
router.delete('/:id',(req,res,next)=>{
  let id = req.params.id;
  let deleteItem = {$pull:{players:{_id: id}}};
  Assistant.findByIdAndUpdate(res.locals.decoded.sub,deleteItem).lean().exec()
    .then( user => res.status(200).json({success: true, message:'Spelaren raderades'}))
    .catch( err => res.status(500).json({success: false, message: err.message}));
});

module.exports = router;
