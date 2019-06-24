'use strict';

const util = require('util');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const validate = require('./validate');

module.exports = (db) => {
    const dbAll = (util.promisify(db.all)).bind(db);
    const dbRun = (sql, params) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                resolve(this.lastID);
            });
        });
    };

    app.get('/health', (req, res) => res.send('Healthy'));

    app.post('/rides', jsonParser, async (req, res) => {
        let values = [];
        try {
            values = await validate(req.body);
        } catch (error) {
            return res.send(error);
        }

        try {
            const lastID = await dbRun('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
            const rows = await dbAll('SELECT * FROM Rides WHERE rideID = ?', lastID);
            res.send(rows);
        } catch (error) {
            return res.send({
                error_code: 'SERVER_ERROR',
                message: 'Unknown error'
            }); 
        }
    });

    app.get('/rides', async (req, res) => {
        const page = Number(req.query.page);
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        let sql = 'SELECT * FROM Rides';
        let params = [];
        if (page) {
            sql = 'SELECT * FROM Rides LIMIT ? OFFSET ?';
            const offset = (page - 1) * limit;
            params = [ limit, offset ];
        }
        try {
            const rows = await dbAll(sql, params);
            if (rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }
            res.send(rows);
        } catch (err) {
            return res.send({
                error_code: 'SERVER_ERROR',
                message: 'Unknown error'
            });
        }
    });

    app.get('/rides/:id', async (req, res) => {
        try {
            const rows = await dbAll(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`);
            if (rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }
            res.send(rows);
        } catch (err) {
            return res.send({
                error_code: 'SERVER_ERROR',
                message: 'Unknown error'
            }); 
        }
    });

    app.use(express.static('doc'));

    return app;
};
