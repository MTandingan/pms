const { conn } = require("../db/dbconfig");

//-------------------- CREATE --------------------//
module.exports.createDepartment = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_department (pdept_schedId,
                                               pdept_locationId,
                                               pdept_batch) 
                                            VALUES (?,?,?)`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create department in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- DELETE --------------------//
module.exports.deleteDepartmentById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_department
                   WHERE
                        pdept_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete department by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- GET --------------------//
module.exports.getDepartmentBySchedId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*
                    FROM
                        tbl_department AS a
                    INNER JOIN
                        tbl_location AS b
                        ON
                            a.pdept_locationId = b.location_id
                    WHERE
                        a.pdept_schedId = ? AND
                        b.location_id = ?`

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get department by sched id and location id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getDepartmentByLocationId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*
                    FROM
                        tbl_department AS a
                    INNER JOIN
                        tbl_location AS b
                        ON
                            a.pdept_locationId = b.location_id
                    WHERE
                        b.location_id = ?`

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get department by location id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getDepartmentOnlyBySchedIdAndLocationId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_department
                    WHERE
                        pdept_schedId = ? AND
                        pdept_locationId = ?`

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get department data only by sched id and location id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getDepartmentAndQuarterDetailsByYearAndBatch = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        b.*,
                        c.*
                    FROM
                        tbl_schedule AS a
                    INNER JOIN
                        tbl_department AS b
                        ON
                            a.sched_id = b.pdept_schedId
                    INNER JOIN
                        tbl_quarter AS c
                        ON
                            c.quarter_pDeptId = b.pdept_id
                    WHERE
                        b.pdept_batch = ? AND
                        a.sched_year = ?`

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get department data and its quarter data details by year and batch in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getDepartmentAndQuarterDetailsBySchedIdAndBatch = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        b.*,
                        c.*,
                        d.*
                    FROM
                        tbl_schedule AS a
                    INNER JOIN
                        tbl_department AS b
                        ON
                            a.sched_id = b.pdept_schedId
                    INNER JOIN
                        tbl_quarter AS c
                        ON
                            c.quarter_pDeptId = b.pdept_id
                    INNER JOIN
                        tbl_location AS d
                        ON
                            d.location_id = b.pdept_locationId
                    WHERE
                        b.pdept_batch = ? AND
                        a.sched_id = ?
                    ORDER BY
                        d.location_name ASC`

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get department data and its quarter data details by sched id and batch in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getDepartmentAndQuarterDetailsBySchedIdAndLocations = (data) => {
    let params = {
        sched_id: data.sched_id
    };

    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        b.*,
                        c.*,
                        d.*
                    FROM
                        tbl_schedule AS a
                    INNER JOIN
                        tbl_department AS b
                        ON
                            a.sched_id = b.pdept_schedId
                    INNER JOIN
                        tbl_quarter AS c
                        ON
                            c.quarter_pDeptId = b.pdept_id
                    INNER JOIN
                        tbl_location AS d
                        ON
                            d.location_id = b.pdept_locationId
                    WHERE
                        d.location_id IN (${data.locations}) AND
                        a.sched_id = ?
                    ORDER BY
                        d.location_name ASC`

        let values = Object.values(params);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get department data and its quarter data details by sched id and locations in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getDepartmentAndQuarterDetailsBySchedIdAndDepartmentId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        b.*,
                        c.*,
                        d.*
                    FROM
                        tbl_schedule AS a
                    INNER JOIN
                        tbl_department AS b
                        ON
                            a.sched_id = b.pdept_schedId
                    INNER JOIN
                        tbl_quarter AS c
                        ON
                            c.quarter_pDeptId = b.pdept_id
                    INNER JOIN
                        tbl_location AS d
                        ON
                            d.location_id = b.pdept_locationId
                    WHERE
                        d.location_deptId = ? AND
                        a.sched_id = ?
                    ORDER BY
                        d.location_name ASC`

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get department data and its quarter data details by sched id and department id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}
