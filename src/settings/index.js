'use strict';
const express = require('express');
const app = express();

const serverSettings = {
  prodUrl: `mongodb://${process.env.MONGOADMIN}:${process.env.MONGOPASS}@127.0.0.1/assistant?authSource=admin`,
  devUrl: 'mongodb://127.0.0.1/assistant'
};

module.exports = serverSettings;
