'use strict';
const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Schema for subdocuments. Instances created when users add players.
const playerSchema = new mongoose.Schema({
  name: String,
  phone: String
});

const trainingSchema = new mongoose.Schema({
  date: Date,
  attending: [String]
});

// Schema for subdocuments. Instances created when users add games.
const gameSchema = new mongoose.Schema({
  opponent: String,
  date: Date,
  venue: String,
  ended: {type:Boolean,'default':false},
  goals: {for:{type:Number,'default':0},against:{type:Number,'default':0}},
  shots: {for:{type:Number,'default':0},against:{type:Number,'default':0}},
  corners: {for:{type:Number,'default':0},against:{type:Number,'default':0}},
  yellow: {for:{type:Number,'default':0},against:{type:Number,'default':0}},
  red: {for:{type:Number,'default':0},against:{type:Number,'default':0}},
  players: [{id:String,name:String,goals:{type:Number,'default':0},shots:{type:Number,'default':0},assists:{type:Number,'default':0},bonus:{type:Number,'default':0},yellow:{type:Number,'default':0},red:{type:Number,'default':0},minutes:{in:{type:Number,'default':0},out:{type:Number,'default':0},total:{type:Number,'default':0}}}]
});

// Main schema. Filled when a user creates an account.
const assistantSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  hash: String,
  salt: String,
  email: String,
  club: String,
  players: [playerSchema],
  games: [gameSchema],
  trainings: [trainingSchema]
});

// Gets the password when user signs up. Encrypts it.
assistantSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
};

// Checks if password is valid at login.
assistantSchema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
  return this.hash === hash;
};

// Generates webtoken. Sets expiration time for 90 days.
assistantSchema.methods.generateJWT = function() {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 365);
  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
    iss: 'LikeAPro'
  }, process.env.SECRET);
};

const assistantModel = mongoose.model('Assistant', assistantSchema);

module.exports = assistantModel;
