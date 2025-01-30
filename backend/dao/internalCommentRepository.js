const { conn } = require("../db/dbconfig");

//-------------------- CREATE --------------------//
module.exports.addComment = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_internalcomment (ic_wsqId,
                                                    ic_description,
                                                    ic_createdAt,
                                                    ic_createdBy,
                                                    ic_createdByUsername,
                                                    ic_updatedAt,
                                                    ic_updatedBy,
                                                    ic_updatedByUsername,
                                                    ic_hasDeleted) 
                                            VALUES (?,?,?,?,?,?,?,?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to add comment in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- UPDATE --------------------//
module.exports.updateComment = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_internalcomment 
                   SET
                        ic_description = ?,
                        ic_updatedAt = ?,
                        ic_updatedBy = ?,
                        ic_updatedByUsername = ?
                   WHERE
                        ic_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update comment by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- DELETE --------------------//
module.exports.deleteComment = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_internalcomment
                   WHERE
                        ic_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete comment by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteCommentByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_internalcomment
                   WHERE
                        ic_wsqId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete comments by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- GET --------------------//
module.exports.getListOfCommentsByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_internalcomment
                    WHERE
                        ic_wsqId = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of comments by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfCommentsAndWsqByCompId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*,
                        c.*
                    FROM
                        tbl_internalcomment AS a
                    INNER JOIN
                        tbl_workstationquarterly AS b
                        ON
                            a.ic_wsqId = b.wsq_id
                    INNER JOIN
                        tbl_workstation AS c
                        ON
                            c.ws_id = b.wsq_wsId
                    WHERE
                        c.ws_compId = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of comments and wsq data by comp id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}
