const util = require('util');

module.exports = (db) => {
    const dbAll = async (sql, params) => {
        const promised = (util.promisify(db.all)).bind(db);
        try {
            const rows = await promised(sql, params);
            if (rows.length === 0) {
                throw {
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                };
            }
            return rows;
        } catch (error) {
            if (error.error_code !== 'RIDES_NOT_FOUND_ERROR') {
                throw {
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                };
            } else {
                throw error;
            }
        }
    };
    const dbRun = (sql, params) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject({ error_code: 'SERVER_ERROR', message: 'Unknown error' });
                resolve(this.lastID);
            });
        });
    };

    return { dbAll, dbRun };
};
