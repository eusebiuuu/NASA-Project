const request = require('supertest');
const app = require('../app');
const { connectToMongoDB, disconnectFromMongoDB } = require('../services/mongo');

describe('Test launches API', () => {
    beforeAll(async () => {
        await connectToMongoDB();
    });

    afterAll(async () => {
        await disconnectFromMongoDB();
    });

    describe('Test GET request on /launches', () => {
        test('Can get all launches', async () => {
            const response = await request(app)
            .get('/v1/launches')
            .expect('Content-Type', /json/)
            .expect(200);
        })
    });
    
    describe('Test POST request on launches', () => {
        const fullData = {
            mission: 'Mission',
            target: 'Kepler-1652 b',
            rocket: 'Rocket',
            launchDate: 'January 22, 2030'
        }
        const dataWithoutDate = {
            mission: 'Mission',
            target: 'Kepler-1652 b',
            rocket: 'Rocket'
        }
        const dataWithInvalidDate = {
            mission: 'Mission',
            target: 'Kepler-1652 b',
            rocket: 'Rocket',
            launchDate: 'January 22, 2022'
        }
        test('Data can be created', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(fullData)
                .expect('Content-Type', /json/)
                .expect(201);
            const requestDate = new Date(fullData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
    
            expect(responseDate).toBe(requestDate);
            expect(response.body).toMatchObject(dataWithoutDate);
        })
        test('Catch incomplete or missing fields', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(dataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);
            expect(response.body).toStrictEqual({
                error: 'Invalid data on input fields!'
            });
        })
        test('Catch invalid date', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(dataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);
            expect(response.body).toStrictEqual({
                error: 'Invalid future date!'
            });
        });
        const invalidPlanet = {
            mission: 'Mission',
            target: 'Kepler-888 f',
            rocket: 'Rocket',
            launchDate: 'January 22, 2030'
        }
        test('Test invalid planet', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(invalidPlanet)
                .expect(400);
            expect(response.body).toStrictEqual({
                error: 'Planet not found!',
            });
        });
    });

    describe('Delete launch', () => {
        test('Delete already deleted launch', async () => {
            const launchId = 10;
            const response = await request(app)
                .delete(`/v1/launches/${launchId}`)
                .expect(404)
            expect(response.body).toStrictEqual({
                error: 'Launch not found!',
            });
        });
    });
})