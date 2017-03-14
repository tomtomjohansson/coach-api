'use strict';
const express = require('express');
const app = express();

const serverSettings = {
  serverUrl: '127.0.0.1',
  database: 'assistant',
  prodUrl: `mongodb://mongo%2dadmin:${process.env.MONGOADMIN}@${this.serverUrl}/${this.database}?authSource=admin`,
  devUrl: `mongodb://${this.serverUrl}/${this.database}`
};

module.exports = serverSettings;
