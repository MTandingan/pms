const { conn } = require("../db/dbconfig");

//-------------------- CREATE --------------------//
module.exports.createWorkstationRights = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_userworkstationrights (wsqRights_wsqId,
                                                          wsqRights_userId,
                                                          wsqRights_userName,
                                                          can_approve_request) 
                                                            VALUES (?,?,?,?)`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create user workstation rights in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- DELETE --------------------//
module.exports.deleteUserWorkstationRightsById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_userworkstationrights
                   WHERE
                        wsqRights_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete user workstation rights id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteUserWorkstationRightsByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_userworkstationrights
                   WHERE
                        wsqRights_wsqId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete user workstation rights by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- GET --------------------//
module.exports.getListOfUserWorkstationRights = () => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_userworkstationrights`;
                        
        conn.query(sql, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all user workstation rights in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfUserWorkstationRightsByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_userworkstationrights
                    WHERE
                        wsqRights_wsqId = ?`;
        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all user workstation rights by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfUserWorkstationRightsByWsqIdAndUserId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_userworkstationrights
                    WHERE
                        wsqRights_wsqId = ? AND
                        wsqRights_userId = ?`;
        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all user workstation rights by wsq id and user id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getUserWorkstationRightsByWsqIdAndUserIdWithAccess = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_userworkstationrights
                    WHERE
                        wsqRights_wsqId = ? AND
                        wsqRights_userId = ? AND
                        can_approve_request = ?`;
        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all user workstation rights by wsq id and user id with permissions in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}


