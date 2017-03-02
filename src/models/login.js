'use strict';
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

const LoginSchema = new mongoose.Schema({
  identityKey: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  failedAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  timeout: {
    type: Date,
    required: true,
    default: new Date()
  },
  inProgress: {
    type: Boolean,
    default: false
  }
});

LoginSchema.static('canAuthenticate', async function (key) {
  const login = await this.findOne({
    identityKey: key
  }).exec();

  if (!login || login.failedAttempts < 3) {
    return true;
  }

  const timeout = ( new Date() - login.timeout.setTime(login.timeout.getTime() + 1000 * 60) );
  if (timeout >= 0) {
    await login.remove();
    return true;
  }
  const query = {identityKey: key};
  const update = {inProgress:false};
  const options = {setDefaultsOnInsert:true,upsert:true};
  await this.findOneAndUpdate(query,update,options).exec();
  return false;
});

LoginSchema.static('failedLoginAttempt', async function (key) {
  const query = {
    identityKey: key
  };
  const update = {
    $inc: {
      failedAttempts: 1
    },
    timeout: new Date(),
    inProgress: false
  };
  const options = {
    setDefaultsOnInsert: true,
    upsert: true
  };
  return await this.findOneAndUpdate(query, update, options).exec();
});

LoginSchema.static('successfulLoginAttempt', async function (key) {
  const login = await this.findOne({
    identityKey: key
  }).exec();
  if (login) {
    return await login.remove();
  }
});

LoginSchema.static('inProgress', async function (key) {
  const login = await this.findOne({identityKey: key}).exec();
  const query = {identityKey: key};
  const update = {inProgress: true};
  const options = {
    setDefaultsOnInsert: true,
    upsert: true
  };
  await this.findOneAndUpdate(query, update, options).exec();
  return (login && login.inProgress);
});

const LoginModel = mongoose.model('Login', LoginSchema);

module.exports = LoginModel;