'use strict';
const validator = require('./defaultObjects');

const loginSchema = {
  'username': validator.username,
  'password': validator.password
};

const registrationSchema = {
  'username': validator.username,
  'password': validator.password,
  'email': validator.email,
  'club': validator.stringRequired
};

const addPlayerSchema = {
  'name': validator.stringRequired,
  'phone': validator.number
};

const addTrainingSchema = {
  'date': validator.date
};

const addGameSchema = {
  'opponent': validator.stringRequired,
  'venue': validator.stringRequired,
  'date': validator.date
};

const substitutionSchema = {
  minute: validator.numberRequired
};

module.exports = {
  loginSchema,
  registrationSchema,
  addPlayerSchema,
  addTrainingSchema,
  addGameSchema,
  substitutionSchema
};
