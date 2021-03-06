'use strict';
const express = require('express');
const router = express.Router();
const Assistant = require('../models/assistant');
const {addPlayerSchema} = require('../validation/userValidation');

// Adds subdocument with new player.
router.post('/',(req,res,next)=>{
  req.checkBody(addPlayerSchema);
    const errors = req.validationErrors();
    if (errors) {
      return res.status(500).json({success:false,message:errors[0].msg});
    }
  const player = {name:req.body.name,phone:req.body.phone};
  const update = {$push:{players:player},$set:{lastUpdate:Date.now()}};
  const option = {new:true,select:{players:1}};
  Assistant.findByIdAndUpdate(res.locals.decoded.sub,update,option).lean().exec()
    .then( data => res.status(201).json({success: true, players: data.players, message:'Spelaren lades till'}))
    .catch(err => res.status(500).json({success: false, message: err.message}));
});

// Deletes subdocument of player.
router.delete('/:id',(req,res,next)=>{
  const deleteItem = {$pull:{players:{_id: req.params.id}}};
  const option = {new:true,select:{players:1}};
  Assistant.findByIdAndUpdate(res.locals.decoded.sub,deleteItem,option).lean().exec()
    .then( user => res.status(200).json({success: true, message:'Spelaren raderades'}))
    .catch( err => res.status(500).json({success: false, message: err.message}));
});

module.exports = router;
