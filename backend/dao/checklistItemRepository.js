const { conn } = require("../db/dbconfig");

//-------------------- CREATE --------------------//
module.exports.createChecklistItem = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_checklistitem (chk_title,
                                                  chk_description,
                                                  chk_isActive) 
                                                VALUES (?,?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create checklist item in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.createQuarterlyWorkstationChecklistItem = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_qtywschecklist (qtychk_wsqId,
                                                   qtychk_chkId,
                                                   qtychk_status) 
                                                VALUES (?,?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create quarterly workstation checklist item in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- UPDATE --------------------//
module.exports.updateChecklistItem = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_checklistitem
                   SET
                        chk_title = ?,
                        chk_description = ?,
                        chk_isActive = ?
                   WHERE
                        chk_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update checklist item by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateQtyChecklistItemStatus = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_qtywschecklist
                   SET
                        qtychk_status = ?
                   WHERE
                        qtychk_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update checklist item status by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}
//-------------------- DELETE --------------------//
module.exports.deleteChecklistItem = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_checklistitem
                   WHERE
                        chk_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete checklist item by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteQtyWsChecklistItemById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_qtywschecklist
                   WHERE
                        qtychk_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete all checklist items in wsq child table by checklist item id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteQtyWsChecklistItemByWsqIdAndId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_qtywschecklist
                   WHERE
                        qtychk_wsqId = ? AND
                        qtychk_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete all checklist items by wsq id and checklist item id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteChecklistByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_qtywschecklist
                   WHERE
                        qtychk_wsqId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete checklist items by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- GET --------------------//
module.exports.getListOfChecklistItemWithRange = (data) => {
    var where_SQL = ``;
    var params = {
        pFrom: data.pFrom,
        pTo: data.pTo
    };

    if(data.chk_isActive != null && data.chk_isActive != ""){
        where_SQL += `AND chk_isActive = ${data.chk_isActive} `;
    }

    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                   FROM
                        tbl_checklistitem
                   WHERE
                        chk_title LIKE N'%${data.chk_title}%' AND
                        chk_description LIKE N'%${data.chk_description}%'
                        ${where_SQL}
                   LIMIT 
                        ?, ?`;

        let values = Object.values(params);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of brand with range limits in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfChecklistItemsByStatus = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_checklistitem
                    WHERE
                        chk_isActive = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all checklist item by status in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getWorkstationQuarterlyChecklistItemsByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*
                    FROM
                        tbl_checklistitem AS a
                    INNER JOIN
                        tbl_qtywschecklist AS b
                        ON
                            a.chk_id = b.qtychk_chkId
                    WHERE
                        b.qtychk_wsqId = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of checklist items and its details by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.checkChecklistItemExistsOnOtherTables = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                    exists(SELECT * FROM tbl_qtywschecklist WHERE qtychk_chkId = ?) AS isExists
                    `;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to check if chedcklist item exists on other tables in DB - ' + err.message));
            }
    
            resolve(results);
        });
    });
}

module.exports.getListOfMissingActiveChecklistItemsByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.chk_id,
                        a.chk_title,
                        a.chk_description,
                        a.chk_isActive
                    FROM
                        tbl_checklistitem AS a
                    INNER JOIN
                        tbl_qtywschecklist AS c 
                            ON 
                                a.chk_id = c.qtychk_chkId 
                                AND c.qtychk_wsqId = ?
                    WHERE
                        a.chk_id NOT IN (
                                            SELECT
                                                b.qtychk_chkId
                                            FROM
                                                tbl_qtywschecklist AS b
                                            WHERE
                                                b.qtychk_wsqId = ? AND
                                                a.chk_id = b.qtychk_chkId AND
                                                a.chk_isActive = ?
                                        )
                    UNION
                        (
                            SELECT
                                a.chk_id,
                                a.chk_title,
                                a.chk_description,
                                a.chk_isActive
                            FROM
                                tbl_checklistitem AS a
                            WHERE NOT EXISTS (
                                                SELECT
                                                    b.qtychk_chkId
                                                FROM
                                                    tbl_qtywschecklist AS b
                                                WHERE
                                                    b.qtychk_wsqId = ? AND
                                                    a.chk_id = b.qtychk_chkId
                                            ) AND 
                                            a.chk_isActive = ?
                        )
                                        `;
    
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of missing checklist items of a quarterly workstation by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getWorkstationQuarterlyChecklistItemDetailsById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*
                    FROM
                        tbl_checklistitem AS a
                    INNER JOIN
                        tbl_qtywschecklist AS b
                        ON
                            a.chk_id = b.qtychk_chkId
                    WHERE
                        b.qtychk_id = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of checklist items and its details by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}