const { conn } = require("../db/dbconfig");

//-------------------- CREATE --------------------//
module.exports.createPmsYear = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_schedule (sched_year) 
                                            VALUES (?)`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create pms schedule in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- GET --------------------//
module.exports.getListOfSchedule = () => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_schedule`;
                        
        conn.query(sql, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all scheduled year of pms in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getPmsScheduleByYear = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_schedule
                    WHERE
                        sched_year = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the scheduled year of pms by year in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getPmsScheduleById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_schedule
                    WHERE
                        sched_id = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the scheduled year of pms by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}


