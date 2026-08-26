const mongoose = require('mongoose');
const config = require('../config');

mongoose.set('strictQuery', true);

const connectDB = async () => {
    if (!config.mongoUri) {
        throw new Error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');
    }
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 10000,
    });
    console.log('Database connected.');
};

module.exports = connectDB;
