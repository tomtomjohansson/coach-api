'use strict';
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Schema for subdocuments. Instances created when users add players.
const playerSchema = new mongoose.Schema({
  name: String,
  phone: String
});

const trainingSchema = new mongoose.Schema({
  date: Date,
  attending: [String],
  attendance: Number
});

const eventSchema = new mongoose.Schema({
  type:String,
  team:String,
  player:String,
  assPlayer:String,
  minute:Number
});

// Schema for subdocuments. Instances created when users add games.
const gameSchema = new mongoose.Schema({
  opponent: String,
  date: Date,
  venue: String,
  ended: {type:Boolean,'default':false},
  events: [eventSchema],
  goals: {for:{type:Number,'default':0},against:{type:Number,'default':0}},
  shots: {for:{type:Number,'default':0},against:{type:Number,'default':0}},
  corners: {for:{type:Number,'default':0},against:{type:Number,'default':0}},
  yellow: {for:{type:Number,'default':0},against:{type:Number,'default':0}},
  red: {for:{type:Number,'default':0},against:{type:Number,'default':0}},
  players: [{name:String,position:String,goals:{type:Number,'default':0},shots:{type:Number,'default':0},assists:{type:Number,'default':0},bonus:{type:Number,'default':0},yellow:{type:Number,'default':0},red:{type:Number,'default':0},minutes:{played:{type:[Number],'default':[]},total:{type:Number,'default':0}}}]
});

// Main schema. Filled when a user creates an account.
const AssistantSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  email: String,
  club: String,
  lastUpdate: Date,
  teamColors: {primary:{type:String,default:'offWhite'},secondary:{type:String,default:'black'}},
  players: [playerSchema],
  games: [gameSchema],
  trainings: [trainingSchema]
});

// Gets the password when user signs up. Encrypts it.
AssistantSchema.methods.setPassword = function(password,next){
  bcrypt.hash(password,14)
    .then( hash => {
      this.password = hash;
      next();
    })
    .catch( err => next(err));
};

// Checks if password is valid at login.
AssistantSchema.methods.validPassword = function(password) {
  return bcrypt.compare(password,this.password);
};

// Generates webtoken. Sets expiration time for 90 days.
AssistantSchema.methods.generateJWT = function() {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 365);
  return jwt.sign({
    sub: this._id,
    exp: parseInt(exp.getTime() / 1000, 10),
    iss: 'LikeAPro'
  }, process.env.SECRET);
};

const assistantModel = mongoose.model('Assistant', AssistantSchema);

module.exports = assistantModel;
