const connectToDatabase = require('../database/connection');
const {serverUrl,database} = require('../settings');
const LoginSchema = require('./login');
const AssistantSchema = require('./assistant');
const mongoose = require('mongoose');

const Assistant = async () => {
    try {
        const conn = await connectToDatabase(serverUrl, database);
        return conn.model('Assistant', AssistantSchema);
    } catch (err) {
        throw err;
    }
};

module.exports = Assistant;
