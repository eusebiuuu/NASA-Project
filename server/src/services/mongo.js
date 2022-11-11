const mongoose = require('mongoose');

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
    console.log('MongoDB is ready!');
});

mongoose.connection.on('error', (error) => {
    console.error(error);
});

async function connectToMongoDB() {
    await mongoose.connect(MONGO_URL);
}

async function disconnectFromMongoDB() {
    await mongoose.disconnect();
}

module.exports = {
    connectToMongoDB,
    disconnectFromMongoDB,
}