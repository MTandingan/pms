const { conn } = require("../db/dbconfig");

//-------------------- CREATE --------------------//
module.exports.createComputerAuditTrail = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_computeraudittrail (compAudit_compId,
                                                       compAudit_message,
                                                       compAudit_date) 
                                                    VALUES (?,?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create computer audit trail in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- GET --------------------//
module.exports.getComputerAuditTrailByCompId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_computeraudittrail
                    WHERE
                        compAudit_compId = ?`

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get computer audit trail by comp id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}
