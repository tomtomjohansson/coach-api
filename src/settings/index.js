'use strict';
const express = require('express');
const app = express();

const serverSettings = {
  prodUrl: `mongodb://mongo%2dadmin:${process.env.MONGOADMIN}@127.0.0.1/assistant?authSource=admin`,
  devUrl: 'mongodb://127.0.0.1/assistant'
};

module.exports = serverSettings;
