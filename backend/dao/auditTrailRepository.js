const { conn } = require("../db/dbconfig");

//-------------------- CREATE --------------------//
module.exports.createAuditTrail = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_audittrail (audit_wsqId,
                                               audit_message,
                                               audit_updatedAt,
                                               audit_updatedBy,
                                               audit_updatedByUsername,
                                               audit_remarks)
                                            VALUES (?,?,?,?,?,?)`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create audit trail in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- GET --------------------//
module.exports.getWorkstationQuarterlyAuditTrail = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_audittrail
                    WHERE
                        audit_wsqId = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get audit trail by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- DELETE --------------------//
module.exports.deleteAuditTrailByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_audittrail
                   WHERE
                        audit_wsqId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete audit trail by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

