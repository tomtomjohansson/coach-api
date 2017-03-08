'use strict';
const express = require('express');
const app = express();

const serverSettings = {
  serverUrl: app.get('env') === 'development' ? '127.0.0.1' : 'example.com',
  database: 'assistant'
};

module.exports = serverSettings;
