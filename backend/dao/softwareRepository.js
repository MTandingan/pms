const { conn } = require("../db/dbconfig");

//-------------------- CREATE --------------------//
module.exports.createQuarterlyWorkstationSoftware = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_qtywssoftware (qtysoft_wsqId,
                                                  qtysoft_swId,
                                                  qtysoft_status,
                                                  qtysoft_brandId,
                                                  qtysoft_remarks) 
                                                VALUES (?,?,?,?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create quarterly workstation software in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.createSoftware = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_software (sw_name,
                                             sw_description,
                                             sw_isActive,
                                             sw_isOthers) 
                                            VALUES (?,?,?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create software in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.createSoftwareReference = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_softwarereference (refsw_swId,
                                                      refsw_wsqId) 
                                                    VALUES (?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create software reference in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- UPDATE --------------------//
module.exports.updateQuarterlyWorkstationSoftwareById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_qtywssoftware 
                   SET
                        qtysoft_remarks = ?,
                        qtysoft_status = ?,
                        qtysoft_brandId = ?
                   WHERE
                        qtysoft_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update quarterly workstation software by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}


module.exports.updateQuarterlyWorkstationSoftwareStatusAndBrandByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_qtywssoftware 
                   SET
                        qtysoft_status = ?,
                        qtysoft_brandId = ?,
                        qtysoft_remarks = ?
                   WHERE
                        qtysoft_wsqId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update all quarterly workstation software by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateSoftware = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_software 
                   SET
                        sw_name = ?,
                        sw_description = ?,
                        sw_isActive = ?,
                        sw_isOthers = ?
                   WHERE
                        sw_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update software by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- DELETE --------------------//
module.exports.deleteQtyWorkstationSoftwareBySwIdAndWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_qtywssoftware
                   WHERE
                        qtysoft_wsqId = ? AND
                        qtysoft_swId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete quarterly workstation software by software id and wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteQtyWorkstationSoftwareBySwId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_qtywssoftware
                   WHERE
                        qtysoft_swId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete quarterly workstation software by software id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteQtyWorkstationSoftwareByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_qtywssoftware
                   WHERE
                        qtysoft_wsqId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete quarterly workstation software by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteSoftware = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_software
                   WHERE
                        sw_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete software by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteQtyWsSoftwareById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_qtywssoftware
                   WHERE
                        qtysoft_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete software of a quarterly workstation by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteSoftwareReferenceBySwIdAndWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_softwarereference
                   WHERE
                        refsw_wsqId = ? AND
                        refsw_swId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete software reference by software id and wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteSoftwareReferenceById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_softwarereference
                   WHERE
                        refsw_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete software reference by software id and wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- GET --------------------//
module.exports.getListOfSoftware = () => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_software`;
                        
        conn.query(sql, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all software in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfSoftwareWoOthers = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_software
                    WHERE
                        sw_isOthers = ?
                        `;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all software with isOthers option in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}


module.exports.getListOfSoftwareByStatusAndOthers = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_software
                    WHERE
                        sw_isActive = ? AND
                        sw_isOthers = ?
                        `;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all software by status and isOthers in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfSoftwareWoOthersAndWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*
                    FROM
                        tbl_software AS a
                    INNER JOIN
                        tbl_qtywssoftware AS b
                        ON
                            a.sw_id = b.qtysoft_swId
                    WHERE
                        a.sw_isOthers = ? AND
                        b.qtysoft_wsqId = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all software with isOthers option and by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfSoftwareOnlyByOthersAndWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*
                    FROM
                        tbl_software AS a
                    INNER JOIN
                        tbl_qtywssoftware AS b
                        ON
                            a.sw_id = b.qtysoft_swId
                    WHERE
                        a.sw_isOthers = ? AND
                        b.qtysoft_wsqId = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of software only with isOthers option and by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getInventorySoftwareReportBySchedIdAndMonthRanges = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        f.sw_id,
                        f.sw_name,
                        COUNT(e.qtysoft_status) AS totalCount,
                        SUM(CASE WHEN e.qtysoft_status = 1 THEN 1 ELSE 0 END) AS Ok,
                        SUM(CASE WHEN e.qtysoft_status = 3 THEN 1 ELSE 0 END) AS Defective
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
                        tbl_workstationquarterly AS d
                        ON
                            d.wsq_quarterId = c.quarter_id
                    INNER JOIN
                        tbl_qtywssoftware AS e
                        ON
                            e.qtysoft_wsqId = d.wsq_id
                    INNER JOIN
                        tbl_software AS f
                        ON
                            f.sw_id = e.qtysoft_swId
                    WHERE
                        a.sched_id = ? AND
                        c.quarter_monthlyQuarter BETWEEN ? AND ?
                    GROUP BY
                        f.sw_id
                    ORDER BY
                        f.sw_name`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get software inventory by sched id and month ranges in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getInventorySoftwareReportBySchedIdMonthRangesAndItemIds = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        f.sw_id,
                        f.sw_name,
                        COUNT(e.qtysoft_status) AS totalCount,
                        SUM(CASE WHEN e.qtysoft_status = 1 THEN 1 ELSE 0 END) AS Ok,
                        SUM(CASE WHEN e.qtysoft_status = 2 THEN 1 ELSE 0 END) AS Defective,
                        SUM(CASE WHEN e.qtysoft_status = 3 THEN 1 ELSE 0 END) AS Na
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
                        tbl_workstationquarterly AS d
                        ON
                            d.wsq_quarterId = c.quarter_id
                    INNER JOIN
                        tbl_qtywssoftware AS e
                        ON
                            e.qtysoft_wsqId = d.wsq_id
                    INNER JOIN
                        tbl_software AS f
                        ON
                            f.sw_id = e.qtysoft_swId
                    WHERE
                        a.sched_id = ? AND
                        f.sw_id IN (?) AND
                        c.quarter_monthlyQuarter BETWEEN ? AND ?
                    GROUP BY
                        f.sw_id
                    ORDER BY
                        f.sw_name`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get software inventory by sched id, software items ids, month ranges in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIds = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        f.sw_id,
                        f.sw_name,
                        g.brand_id,
                        g.brand_name,
                        d.wsq_status,
                        COUNT(e.qtysoft_status) AS totalCount,
                        SUM(CASE WHEN e.qtysoft_status = 1 THEN 1 ELSE 0 END) AS Ok,
                        SUM(CASE WHEN e.qtysoft_status = 2 THEN 1 ELSE 0 END) AS Defective,
                        SUM(CASE WHEN e.qtysoft_status = 3 THEN 1 ELSE 0 END) AS Na
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
                        tbl_workstationquarterly AS d
                        ON
                            d.wsq_quarterId = c.quarter_id
                    INNER JOIN
                        tbl_qtywssoftware AS e
                        ON
                            e.qtysoft_wsqId = d.wsq_id
                    INNER JOIN
                        tbl_software AS f
                        ON
                            f.sw_id = e.qtysoft_swId
                    LEFT JOIN
                        tbl_brand AS g
                        ON
                            g.brand_id = e.qtysoft_brandId
                    WHERE
                        a.sched_id = ? AND
                        f.sw_id IN (?) AND
                        c.quarter_monthlyQuarter BETWEEN ? AND ?
                    GROUP BY
                        f.sw_id,
                        g.brand_id,
                        d.wsq_status
                    ORDER BY
                        f.sw_name`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get software inventory by sched id, software items ids, month ranges in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getInventorySoftwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2 = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        f.sw_id,
                        f.sw_name,
                        g.brand_id,
                        g.brand_name,
                        d.wsq_id,
                        d.wsq_status,
                        d.wsq_resolution,
                        d.wsq_wsId,
                        e.qtysoft_swId,
                        c.quarter_monthlyQuarter,
                        e.qtysoft_status,
                        IF(e.qtysoft_status = 1, 1, 0) AS Ok,
                        IF(e.qtysoft_status = 2, 1, 0) AS Defective,
                        IF(e.qtysoft_status = 3, 1, 0) AS Na
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
                        tbl_workstationquarterly AS d
                        ON
                            d.wsq_quarterId = c.quarter_id
                    INNER JOIN
                        tbl_qtywssoftware AS e
                        ON
                            e.qtysoft_wsqId = d.wsq_id
                    INNER JOIN
                        tbl_software AS f
                        ON
                            f.sw_id = e.qtysoft_swId
                    LEFT JOIN
                        tbl_brand AS g
                        ON
                            g.brand_id = e.qtysoft_brandId
                    WHERE
                        a.sched_id = ? AND
                        f.sw_id IN (?) AND
                        d.wsq_resolution = ? AND
                        d.wsq_status = ? AND
                        (c.quarter_monthlyQuarter BETWEEN ? AND ?)
                    ORDER BY
                        d.wsq_wsId,
                        c.quarter_monthlyQuarter,
                        f.sw_id`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get software inventory by sched id, software items ids, month ranges in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfSoftwareReferenceByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_softwarereference
                    WHERE
                        refsw_wsqId = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of software reference by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfWsSoftwareDetailsByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*,
                        c.*
                    FROM
                        tbl_software AS a
                    INNER JOIN
                        tbl_qtywssoftware AS b
                        ON
                            a.sw_id = b.qtysoft_swId
                    LEFT JOIN
                        tbl_brand AS c
                        ON
                            c.brand_id = b.qtysoft_brandId
                    WHERE
                        b.qtysoft_wsqId = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of software details of a quarterly workstation by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getWsSoftwareDetailsByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*,
                        c.*
                    FROM
                        tbl_software AS a
                    INNER JOIN
                        tbl_qtywssoftware AS b
                        ON
                            a.sw_id = b.qtysoft_swId
                    LEFT JOIN
                        tbl_brand AS c
                        ON
                            c.brand_id = b.qtysoft_brandId
                    WHERE
                        b.qtysoft_id = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get software details of a quarterly workstation by software id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfMissingActiveSoftwareByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.sw_id,
                        a.sw_name,
                        a.sw_description,
                        a.sw_isActive,
                        a.sw_isOthers
                    FROM
                        tbl_software AS a
                    WHERE NOT EXISTS (
                                        SELECT
                                            b.qtysoft_id
                                        FROM
                                            tbl_qtywssoftware AS b
                                        WHERE
                                            b.qtysoft_wsqId = ? AND
                                            a.sw_id = b.qtysoft_swId
                                    ) AND 
                                    a.sw_isActive = ? AND
                                    a.sw_isOthers = ? 
                                        `;
    
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of missing software of a quarterly workstation by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfMissingActiveSoftwareWithOthersByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.sw_id,
                        a.sw_name,
                        a.sw_description,
                        a.sw_isActive,
                        a.sw_isOthers
                    FROM
                        tbl_software AS a
                    INNER JOIN
                        tbl_softwarereference AS c 
                            ON 
                                a.sw_Id = c.refsw_swId 
                                AND c.refsw_wsqId = ?
                    WHERE
                        a.sw_id NOT IN (
                                            SELECT
                                                b.qtysoft_swId
                                            FROM
                                                tbl_qtywssoftware AS b
                                            WHERE
                                                b.qtysoft_wsqId = ? AND
                                                a.sw_id = b.qtysoft_swId AND
                                                a.sw_isActive = ?
                                        )
                    UNION
                        (
                            SELECT
                                a.sw_id,
                                a.sw_name,
                                a.sw_description,
                                a.sw_isActive,
                                a.sw_isOthers
                            FROM
                                tbl_software AS a
                            WHERE NOT EXISTS (
                                                SELECT
                                                    b.qtysoft_id
                                                FROM
                                                    tbl_qtywssoftware AS b
                                                WHERE
                                                    b.qtysoft_wsqId = ? AND
                                                    a.sw_id = b.qtysoft_swId
                                            ) AND 
                                            a.sw_isActive = ? AND
                                            a.sw_isOthers = ? 
                        )
                                        `;
    
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of missing software with others of a quarterly workstation by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfSoftwareWithRange = (data) => {
    var where_SQL = ``;
    var params = {
        pFrom: data.pFrom,
        pTo: data.pTo
    };

    if(data.sw_isActive != null && data.sw_isActive != ""){
        where_SQL += `AND sw_isActive = ${data.sw_isActive} `;
    }

    if(data.sw_isOthers != null && data.sw_isOthers != ""){
        where_SQL += `AND sw_isOthers = ${data.sw_isOthers} `;
    }

    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                   FROM
                        tbl_software
                   WHERE
                        sw_name LIKE N'%${data.sw_name}%' AND
                        sw_description LIKE N'%${data.sw_description}%'
                        ${where_SQL}
                   LIMIT 
                        ?, ?`;

        let values = Object.values(params);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of software with range limits in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.checkSoftwareExistsOnOtherTables = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                    (SELECT CASE WHEN EXISTS(SELECT * FROM tbl_qtywssoftware WHERE qtysoft_swId = ?) THEN 1 ELSE 0 END) AS isExistsInQtySw,
                    (SELECT CASE WHEN EXISTS(SELECT * FROM tbl_softwarereference WHERE refsw_swId = ?) THEN 1 ELSE 0 END) AS isExistsInSwRef;
                    `;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to if software exists under tbl_qtywssoftware in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}
