const { conn } = require("../db/dbconfig");

//-------------------- GET --------------------//
module.exports.getAccessRights = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_accessrights
                    WHERE
                        acc_id = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get access rights by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}