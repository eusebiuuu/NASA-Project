const express = require('express');

const { planetsRouter } = require('./planets.router');
const { launchRouter } = require('./launches.router');

const apiV1 = express.Router();

apiV1.use('/planets', planetsRouter);
apiV1.use('/launches', launchRouter);

module.exports = {
    apiV1
}