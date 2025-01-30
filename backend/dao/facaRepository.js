const { conn } = require("../db/dbconfig");

//-------------------- CREATE --------------------//
module.exports.createFaca = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_faca (faca_wsqId,
                                         faca_date,
                                         faca_findings,
                                         faca_recommendation,
                                         faca_ticketNum) 
                                        VALUES (?,?,?,?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create faca in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- GET --------------------//
module.exports.getListOfFacaByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        b.*
                    FROM
                        tbl_workstationquarterly AS a
                    INNER JOIN
                        tbl_faca AS b
                        ON
                            a.wsq_id = b.faca_wsqId
                    WHERE
                        b.faca_wsqId = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of faca of a quarterly workstation by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- DELETE --------------------//
module.exports.deleteFaca = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_faca
                   WHERE
                        faca_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete faca by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteFacaByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_faca
                   WHERE
                        faca_wsqId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete faca by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}



