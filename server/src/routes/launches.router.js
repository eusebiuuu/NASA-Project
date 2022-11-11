const express = require('express');

const {httpGetAllLaunches, httpAbortLaunch, httpAddNewLaunch} = require('./launches.controller');

const launchRouter = express.Router();

launchRouter.get('/', httpGetAllLaunches);
launchRouter.post('/', httpAddNewLaunch);
launchRouter.delete('/:id', httpAbortLaunch);

module.exports = {
    launchRouter
}