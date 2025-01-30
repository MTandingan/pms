const { conn } = require("../db/dbconfig");

//-------------------- CREATE --------------------//
module.exports.createlocation = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_location (location_deptId,
                                             location_name,
                                             location_description,
                                             location_isActive,
                                             location_deptName) 
                                            VALUES (?,?,?,?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create location in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- UPDATE --------------------//
module.exports.updatelocation = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_location
                   SET
                        location_deptId = ?,
                        location_name = ?,
                        location_description = ?,
                        location_isActive = ?,
                        location_deptName = ?
                   WHERE
                        location_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update location by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- DELETE --------------------//
module.exports.deletelocation = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_location
                   WHERE
                        location_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete location by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- GET --------------------//
module.exports.getlistOfLocationWithRange = (data) => {
    var where_SQL = ``;
    var params = {
        pFrom: data.pFrom,
        pTo: data.pTo
    };

    if(data.location_isActive != null && data.location_isActive != ""){
        where_SQL += `AND location_isActive = ${data.location_isActive} `;
    }

    if(data.location_departmentId != null && data.location_departmentId != ""){
        where_SQL += `AND location_deptId = ${data.location_departmentId} `;
    }

    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                   FROM
                        tbl_location
                   WHERE
                        location_name LIKE N'%${data.location_name}%' AND
                        location_description LIKE N'%${data.location_description}%' 
                        ${where_SQL}
                   ORDER BY
                        location_id DESC
                   LIMIT 
                        ?, ?`;

        let values = Object.values(params);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of location with range limits in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getAllListOfLocation = () => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                   FROM
                        tbl_location`;

        conn.query(sql, (err, results) => {
            if(err){
                reject(new Error('Failed to get all list of location in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getAllListOfLocationWithMonthlyBatchBySchedId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        c.*,
                        d.quarter_monthlyQuarter
                   FROM
                        tbl_schedule AS a
                   INNER JOIN
                       tbl_department AS b
                        ON
                            a.sched_id = b.pdept_schedId    
                   INNER JOIN
                        tbl_location AS c
                        ON
                            c.location_id = b.pdept_locationId
                   INNER JOIN
                        tbl_quarter AS d
                        ON
                            b.pdept_id = d.quarter_pDeptId
                   WHERE
                        a.sched_id = ?`;
        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get all list of location with monthly batches by sched id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}
