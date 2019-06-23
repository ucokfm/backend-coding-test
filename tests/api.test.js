'use strict';

const request = require('supertest');
const assert = require('assert');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
    before((done) => {
        db.serialize((err) => { 
            if (err) {
                return done(err);
            }

            buildSchemas(db);

            done();
        });
    });

    describe('GET /health', () => {
        it('should return health', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(200, done);
        });
    });

    describe('GET /rides', () => {
        it('should return error could not find rides', (done) => {
            request(app)
                .get('/rides')
                .expect('Content-Type', /json/)
                .expect(200, {
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides',
                }, done);
        });
    });

    describe('POST /rides', () => {
        it('should create new ride', (done) => {
            request(app)
                .post('/rides')
                .send({
                    start_lat: 80,
                    start_long: 80,
                    end_lat: 80,
                    end_long: 80,
                    rider_name: 'John Doe',
                    driver_name: 'Richard',
                    driver_vehicle: 'Car',
                })
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    assert.equal(res.body[0].rideID, 1);
                    assert.ok(res.body[0].created);
                    done();
                });
        });

        it('should return latitude longitude validation error', (done) => {
            request(app)
                .post('/rides')
                .send({
                    start_lat: 200,
                    start_long: 80,
                    end_lat: 80,
                    end_long: 80,
                    rider_name: 'John Doe',
                    driver_name: 'Richard',
                    driver_vehicle: 'Car',
                })
                .expect('Content-Type', /json/)
                .expect(200, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
                }, done);
        });

        it('should return empty string validation error', (done) => {
            request(app)
                .post('/rides')
                .send({
                    start_lat: 80,
                    start_long: 80,
                    end_lat: 80,
                    end_long: 80,
                    rider_name: '',
                    driver_name: 'Richard',
                    driver_vehicle: 'Car',
                })
                .expect('Content-Type', /json/)
                .expect(200, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Rider name must be a non empty string',
                }, done);
        });
    });

    describe('GET /rides', () => {
        it('should return rides', (done) => {
            request(app)
                .get('/rides')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.length, 1);
                    done();
                });
        });
    });

    describe('GET /rides/{rideID}', () => {
        it('should return a ride', (done) => {
            request(app)
                .get('/rides/1')
                .expect('Content-Type', /json/)
                .expect(200, done); 
        });

        it('should error could not find any rides', (done) => {
            request(app)
                .get('/rides/2')
                .expect('Content-Type', /json/)
                .expect(200, {
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides',
                }, done); 
        });
    });
});
