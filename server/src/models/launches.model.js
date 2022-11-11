const launches = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

const FIRST_FLIGHT_NUMBER = 0, SPACEX_URL = 'https://api.spacexdata.com/v5/launches/query';

async function getAllLaunches(skip, limit) {
    return await launches.find({}, {
        '_id': 0,
        '__v': 0
    })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveSpaceXLaunchesToDB() {
    const responseOneLaunch = await axios.post(SPACEX_URL, {
        query: {},
        options: {
            page: 1,
            limit: 1,
        }
    });
    const presentLaunchesCount = (await launches.find({})).length;
    if (responseOneLaunch.data.totalDocs < presentLaunchesCount + 10) {
        console.log('Launches already saved!');
    } else {
        console.log('Loading launches');
        await loadSpaceXLaunches();
    }
}

async function loadSpaceXLaunches() {
    const response = await axios.post(SPACEX_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1,
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1,
                    }
                }
            ]
        }
    });
    if (response.status !== 200) {
        console.log('Loading SpaceX launches failed.');
        return;
    }
    const launchesDocs = response.data.docs;
    // console.log(launchesDocs.length);
    for (const launch of launchesDocs) {
        const payloads = launch.payloads;
        let customers = [];
        payloads.forEach((payload) => {
            customers = [...customers, ...payload.customers];
        });
        const currentLaunch = {
            mission: launch.name,
            flightNumber: launch.flight_number,
            rocket: launch.rocket.name,
            launchDate: launch.date_local,
            upcoming: launch.upcoming,
            success: launch.success,
            target: 'not specified',
            customers: customers,
        }
        await saveNewLaunch(currentLaunch);
    }
}

async function isValidPlanet(planetName) {
    const planet = await planets.findOne({kepler_name: planetName});
    if (!planet) {
        return false;
    }
    return true;
}

async function getLastFlightNumber() {
    const lastLaunch = await launches.findOne({}).sort('-flightNumber');
    if (!lastLaunch) {
        return FIRST_FLIGHT_NUMBER;
    }
    return lastLaunch.flightNumber;
}

async function saveNewLaunch(launch) {
    if (!launch.mission || !launch.target || !launch.rocket || !launch.launchDate) {
        return {
            ok: false,
            err: 'Invalid data on input fields!'
        };
    }
    launch.launchDate = new Date(launch.launchDate);
    if ((launch.upcoming && launch.launchDate < Date.now()) || isNaN(launch.launchDate)) {
        return {
            ok: false,
            err: 'Invalid future date!'
        };
    }
    await launches.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true,
    });
    return {
        ok: true,
    }
}

async function upsertLaunch(launch) {
    const isValid = await isValidPlanet(launch.target);
    if (!isValid) {
        return {
            ok: false,
            err: 'Planet not found!'
        };
    }
    const currentFlightNumber = (await getLastFlightNumber()) + 1;
    const completeLaunch = Object.assign(launch, {
        flightNumber: currentFlightNumber,
        success: true,
        upcoming: true,
        customers: ['ZTM', 'NASA']
    });
    return await saveNewLaunch(completeLaunch);
}

async function isValidLaunch(flightNumber) {
    const actualLaunch = await launches.findOne({flightNumber: flightNumber});
    if (!actualLaunch) {
        return false;
    }
    return true;
}

async function abortLaunch(flightNumber) {
    const foundLaunch = await isValidLaunch(flightNumber);
    if (!foundLaunch) {
        return {
            ok: false,
            err: 'Launch not found!',
        }
    }
    const abortedLaunch = await launches.updateOne({
        flightNumber: flightNumber,
    }, {
        upcoming: false,
        success: false,
    });
    return {
        ok: abortedLaunch.modifiedCount === 1,
        err: 'Launch not found!',
    };
}

module.exports = {
    getAllLaunches,
    upsertLaunch,
    abortLaunch,
    saveSpaceXLaunchesToDB,
};