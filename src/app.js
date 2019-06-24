'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const enhanceDb = require('./enhance-db');
const validate = require('./validate');

module.exports = (db) => {
    const { dbAll, dbRun } = enhanceDb(db);

    app.get('/health', (req, res) => res.send('Healthy'));

    app.post('/rides', jsonParser, async (req, res) => {
        try {
            const values = await validate(req.body);
            const lastID = await dbRun('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
            const rows = await dbAll('SELECT * FROM Rides WHERE rideID = ?', lastID);
            res.send(rows);
        } catch (error) {
            return res.send(error);
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
            res.send(rows);
        } catch (error) {
            return res.send(error);
        }
    });

    app.get('/rides/:id', async (req, res) => {
        try {
            const rows = await dbAll('SELECT * FROM Rides WHERE rideID=?', [req.params.id]);
            res.send(rows);
        } catch (error) {
            return res.send(error); 
        }
    });

    app.use(express.static('doc'));

    return app;
};
