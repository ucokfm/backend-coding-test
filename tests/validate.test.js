'use strict';

const assert = require('assert');
const validate = require('../src/validate');

describe('Validation', () => {
    describe('validate true', () => {
        it('should return array of valid data values', async () => {
            const data = {
                start_lat: 80,
                start_long: 80,
                end_lat: 80,
                end_long: 80,
                rider_name: 'John Doe',
                driver_name: 'Richard',
                driver_vehicle: 'Car',
            };
            const values = await validate(data);
            assert.deepEqual(values, [80, 80, 80, 80, 'John Doe', 'Richard', 'Car']);
        });

        it('should throw latitude error', async () => {
            const data = {
                start_lat: 200,
                start_long: 80,
                end_lat: 80,
                end_long: 80,
                rider_name: 'John Doe',
                driver_name: 'Richard',
                driver_vehicle: 'Car',
            };
            try {
                await validate(data);
            } catch (error) {
                assert.deepEqual(error, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
                });
            }
        });

        it('should throw empty string error', async () => {
            const data = {
                start_lat: 80,
                start_long: 80,
                end_lat: 80,
                end_long: 80,
                rider_name: '',
                driver_name: 'Richard',
                driver_vehicle: 'Car',
            };
            try {
                await validate(data);
            } catch (error) {
                assert.deepEqual(error, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Rider name must be a non empty string',
                });
            } 
        });
    });
});
