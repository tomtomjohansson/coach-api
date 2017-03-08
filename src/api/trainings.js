'use strict';
const express = require('express');
const router = express.Router();
const Assistant = require('../models/assistant');
const mongoose = require('mongoose');
const {addTrainingSchema} = require('../validation/userValidation');

router.get('/',(req,res,next)=>{
  Assistant.findById(res.locals.decoded.sub).lean().exec()
    .then( user => res.status(200).json({success: true, trainings:user.trainings, message: 'Träningarna hämtades'}))
    .catch( err => res.status(500).json({sucess:false, message: err.message}));
});

// Adds subdocument with training
router.post('/',(req,res,next)=>{
  req.checkBody(addTrainingSchema);
    const errors = req.validationErrors();
    if (errors) {
      return res.status(500).json({success:false,message:errors[0].msg});
    }
  const update = {$push:{trainings:req.body}};
  const option = {new:true};
  Assistant.findByIdAndUpdate(res.locals.decoded.sub,update,option).lean().exec()
    .then( user => res.status(201).json({success:true, trainings: user.trainings, message: 'Träningen lades till'}))
    .catch( err => res.status(500).json({success: false, message: err.message}));
});

// Updates specific training. Returns training.
router.put('/',(req,res,next)=>{
  req.body.training.attending = req.body.attending;
  let find = {'trainings._id':mongoose.Types.ObjectId(req.body.training._id)};
  let update = {$set:{'trainings.$':req.body.training}};
  let option = {new:true};
  Assistant.findOneAndUpdate(find,update,option).lean().exec()
    .then( user => res.status(200).json({success:true, message: 'Träningen uppdaterades'}))
    .catch( err => res.status(500).json({success: false, message: err.message}));
});

// Deletes subdocument of training.
router.delete('/:id',(req,res,next)=>{
  let id = req.params.id;
  let deleteItem = {$pull:{trainings:{_id: id}}};
  Assistant.findByIdAndUpdate(res.locals.decoded.sub,deleteItem).lean().exec()
    .then( user => res.status(200).json({success: true, message:'Träningen raderades'}))
    .catch( err => res.status(500).json({success: false, message: err.message}));
});

module.exports = router;

// db.assistants.aggregate(
// 	{$match:{username:'tysken'}},
// 	{$unwind:'$trainings'},
// 	{$sort:{'trainings.date':1}},
// 	{$group:{
// 		_id:'$_id',
// 		'finished':{
// 			$push:{
// 				$cond:{
// 					if:{$gte:[{$size:'$trainings.attending'},1]},
// 					then:'$trainings',
// 					else:"$noval"
// 				}
// 			}
// 		},
// 		'unfinished':{
// 			$push:{
// 				$cond:{
// 					if:{$lte:[{$size:'$trainings.attending'},1]},
// 					then:'$trainings',
// 					else:"$noval"
// 				}
// 			}
// 		}
// 	}},
// 	{$project:{
// 		trainings:{$slice:['$finished',-5,5]},
// 		upcoming:{$slice:['$unfinished',0,5]}
// 	}}
// ).pretty()