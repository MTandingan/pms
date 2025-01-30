const { conn } = require("../db/dbconfig");

//-------------------- CREATE --------------------//
module.exports.createComputer = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_computer (comp_name,
                                             comp_description,
                                             comp_inventoryId,
                                             comp_barCode,
                                             comp_serial,
                                             comp_status) 
                                            VALUES (?,?,?,?,?,?)`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create computer in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- UPDATE --------------------//
module.exports.updateComputer = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_computer 
                   SET
                        comp_name = ?,
                        comp_description = ?,
                        comp_inventoryId = ?,
                        comp_serial = ?,
                        comp_status = ?
                   WHERE
                        comp_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update computer by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateComputerBarCode = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_computer 
                   SET
                        comp_barCode = ?
                   WHERE
                        comp_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update computer bar code by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateComputerStatus = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_computer 
                   SET
                        comp_status = ?
                   WHERE
                        comp_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update computer status by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- DELETE --------------------//
module.exports.deleteComputer = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_computer
                   WHERE
                        comp_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete computer in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- GET --------------------//
module.exports.getListOfComputer = () => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_computer`;
                        
        conn.query(sql, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all computer in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfComputerNotStatus = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_computer
                    WHERE
                        comp_status != ?`;
                       
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all computer NOT status in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfComputerByStatus = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_computer
                    WHERE
                        comp_status = ?`;
                       
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all computer by status in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getComputer = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_computer
                    WHERE
                        comp_id = ?`;
        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the computer by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getWsqDetailsByParams = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        c.*
                    FROM
                        tbl_computer AS a
                    INNER JOIN
                        tbl_workstation AS b
                        ON
                            a.comp_id = b.ws_compId
                    INNER JOIN
                        tbl_workstationquarterly AS c
                        ON
                            b.ws_id = c.wsq_wsId
                    WHERE
                        a.comp_id = ? AND
                        a.comp_status = ? AND
                        b.ws_isActive = ? AND
                        c.wsq_status = ? AND
                        c.wsq_resolution = ?`;
        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the wsq details of a computer by many params in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfComputerWithRange = (data) => {
    var where_SQL = ``;
    var params = {
        pFrom: data.pFrom,
        pTo: data.pTo
    };

    if(data.comp_status != null && data.comp_status != 0){
        where_SQL += `AND comp_status = ${data.comp_status} `;
    }

    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                   FROM
                        tbl_computer
                   WHERE
                        comp_name LIKE N'%${data.comp_name}%' AND
                        comp_inventoryId LIKE N'%${data.comp_inventoryId}%' AND
                        comp_barCode LIKE N'%${data.comp_barCode}%' AND
                        comp_serial LIKE N'%${data.comp_serial}%'
                        ${where_SQL}
                   ORDER BY
                        comp_id DESC
                   LIMIT 
                        ?, ?
                    `;
        let values = Object.values(params);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of computer with range limits in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.checkComputerExistsOnOtherTables = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                   exists(SELECT * FROM tbl_workstation WHERE ws_compId = ?) AS isExists
                    `;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to check if computer exists under tbl_workstation in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}