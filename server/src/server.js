const http = require('http');

require('dotenv').config();

const { saveSpaceXLaunchesToDB } = require('./models/launches.model');
const { findHabitablePlanets } = require('./models/planets.model');
const { connectToMongoDB } = require('./services/mongo');
const app = require('./app');

const PORT = process.env.PORT ?? 8000;
const server = http.createServer(app);

async function startServer() {
    await connectToMongoDB();
    await findHabitablePlanets();
    await saveSpaceXLaunchesToDB();
    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}...`);
    });
}

startServer();