'use strict';
const express = require('express');
const router = express.Router();
const Assistant = require('../models/connectModels');
const mongoose = require('mongoose');

router.get('/',(req,res,next)=>{
  Assistant.findById(res.locals.decoded.sub,(err,user)=>{
    if (err){
      return res.status(500).json({sucess:false, message: err.message});
    }
    else {
      res.status(200).json({success: true, trainings:user.trainings, message: 'Träningarna hämtades'});
    }
  });
});

// Adds subdocument with training
router.post('/',(req,res,next)=>{
  const user_id = res.locals.decoded.sub;
  const training = req.body;
  const update = {$push:{trainings:training}};
  const option = {new:true};
  Assistant.findByIdAndUpdate(user_id,update,option,(err,user)=>{
    if (err) {
      return res.status(500).json({success: false, message: err.message});
    }
    else {
      const {trainings} = user;
      res.status(201).json({success:true, trainings, message: 'Träningen lades till'});
    }
  });
});

// Updates specific training. Returns training.
router.put('/',(req,res,next)=>{
  req.body.training.attending = req.body.attending;
  let find = {'trainings._id':mongoose.Types.ObjectId(req.body.training._id)};
  let update = {$set:{'trainings.$':req.body.training}};
  let option = {new:true};
  Assistant.findOneAndUpdate(find,update,option,(err,training)=>{
    if (err){
      return res.status(500).json({success: false, message: err.message});
    }
    else {
      res.status(200).json({success:true, message: 'Träningen uppdaterades'});
    }
  });
});

// Deletes subdocument of training.
router.delete('/:id',(req,res,next)=>{
  let id = req.params.id;
  let deleteItem = {$pull:{trainings:{_id: id}}};
  Assistant.findByIdAndUpdate(res.locals.decoded.sub,deleteItem,(err,user)=>{
    if (err){
      return res.status(500).json({success: false, message: err.message});
    }
    else {
      res.status(200).json({success: true, message:'Träningen raderades'});
    }
  });
});

module.exports = router;
