const planets = require('./planets.mongo');

const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');

function isHabitable(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6;
}

async function getAllPlanets() {
    return await planets.find({}, {
        '_id': 0,
        '__v': 0
    });
}

async function upsertPlanet(planet) {
    await planets.updateOne({
        kepler_name: planet.kepler_name,
    }, {
        kepler_name: planet.kepler_name,
    }, {
        upsert: true,
    });
}

function findHabitablePlanets() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
        .pipe(parse({
            comment: '#',
            columns: true,
        }))
        .on('data', async (data) => {
            if (isHabitable(data)) {
                await upsertPlanet(data);
            }
        })
        .on('error', (err) => {
            console.log(err);
            reject(err);
        })
        .on('end', async () => {
            const planetsCount = (await getAllPlanets()).length;
            console.log(`${planetsCount} habitable planets found!`);
            resolve();
        });
    });
}

module.exports = {
    findHabitablePlanets,
    getAllPlanets
};