const { getAllLaunches, upsertLaunch, abortLaunch } = require('../models/launches.model');
const { getPagination } = require('../services/query');

async function httpGetAllLaunches(req, res) {
    const { skip, limit } = getPagination(req.query);
    return res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpAddNewLaunch(req, res) {
    const launch = req.body;
    const response = await upsertLaunch(launch);
    if (!response.ok) {
        return res.status(400).json({
            error: response.err,
        });
    }
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    const launchId = Number(req.params.id);
    const response = await abortLaunch(launchId);
    if (!response.ok) {
        return res.status(404).json({
            error: response.err,
        });
    }
    return res.status(200).json({
        ok: true
    });
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
}