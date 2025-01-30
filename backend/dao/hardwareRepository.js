const { conn } = require("../db/dbconfig");

//-------------------- CREATE --------------------//
module.exports.createQuarterlyWorkstationHardware = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_qtywshardware (qtyhard_wsqId,
                                                  qtyhard_hwId,
                                                  qtyhard_status,
                                                  qtyhard_brandId,
                                                  qtyhard_remarks) 
                                                VALUES (?,?,?,?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create quarterly workstation hardware in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.createHardware = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_hardware (hw_name,
                                             hw_description,
                                             hw_isActive,
                                             hw_isOthers) 
                                            VALUES (?,?,?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create hardware in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.createHardwareReference = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_hardwarereference (refhw_hwId,
                                                      refhw_wsqId) 
                                                    VALUES (?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create hardware reference in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- UPDATE --------------------//
module.exports.updateQuarterlyWorkstationHardwareById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_qtywshardware 
                   SET
                        qtyhard_remarks = ?,
                        qtyhard_status = ?,
                        qtyhard_brandId = ?
                   WHERE
                        qtyhard_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update quarterly workstation hardware by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateQuarterlyWorkstationHardwareStatusAndBrandByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_qtywshardware 
                   SET
                        qtyhard_status = ?,
                        qtyhard_brandId = ?,
                        qtyhard_remarks = ?
                   WHERE
                        qtyhard_wsqId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update all quarterly workstation hardware by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateHardware = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_hardware 
                   SET
                        hw_name = ?,
                        hw_description = ?,
                        hw_isActive = ?,
                        hw_isOthers = ?
                   WHERE
                        hw_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update hardware by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- DELETE --------------------//
module.exports.deleteQtyWorkstationHardwareByHwIdAndWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_qtywshardware
                   WHERE
                        qtyhard_wsqId = ? AND
                        qtyhard_hwId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete quarterly workstation hardware by hardware id and wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteQtyWorkstationHardwareByHwId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_qtywshardware
                   WHERE
                        qtyhard_hwId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete quarterly workstation hardware by hardware id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteQtyWorkstationHardwareByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_qtywshardware
                   WHERE
                        qtyhard_wsqId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete quarterly workstation hardware by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteHardware = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_hardware
                   WHERE
                        hw_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete hardware by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteQtyWsHardwareById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_qtywshardware
                   WHERE
                        qtyhard_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete hardware of a quarterly workstation by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteHardwareReferenceByHwIdAndWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_hardwarereference
                   WHERE
                        refhw_wsqId = ? AND
                        refhw_hwId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete hardware reference by hardware id and wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteHardwareReferenceById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_hardwarereference
                   WHERE
                        refhw_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete hardware reference by hardware id and wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- GET --------------------//
module.exports.getListOfHardware = () => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_hardware`;
                        
        conn.query(sql, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all hardware in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfHardwareWoOthers = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_hardware
                    WHERE
                        hw_isOthers = ?
                        `;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all hardware with isOthers option in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfHardwareByStatusAndOthers = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_hardware
                    WHERE
                        hw_isActive = ? AND
                        hw_isOthers = ?
                        `;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all hardware by status and isOthers in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfHardwareWoOthersAndWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*
                    FROM
                        tbl_hardware AS a
                    INNER JOIN
                        tbl_qtywshardware AS b
                        ON
                            a.hw_id = b.qtyhard_hwId
                    WHERE
                        a.hw_isOthers = ? AND
                        b.qtyhard_wsqId = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all hardware with isOthers option and by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfHardwareOnlyByOthersAndWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*
                    FROM
                        tbl_hardware AS a
                    INNER JOIN
                        tbl_qtywshardware AS b
                        ON
                            a.hw_id = b.qtyhard_hwId
                    WHERE
                        a.hw_isOthers = ? AND
                        b.qtyhard_wsqId = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of hardware only with isOthers option and by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfWsHardwareDetailsByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*,
                        c.*
                    FROM
                        tbl_hardware AS a
                    INNER JOIN
                        tbl_qtywshardware AS b
                        ON
                            a.hw_id = b.qtyhard_hwId
                    LEFT JOIN
                        tbl_brand AS c
                        ON
                            c.brand_id = b.qtyhard_brandId
                    WHERE
                        b.qtyhard_wsqId = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of hardware details of a quarterly workstation by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfWsHardwareByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_qtywshardware
                    WHERE
                        qtyhard_wsqId = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of hardware of a quarterly workstation by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfHardwareReferenceByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_hardwarereference
                    WHERE
                        refhw_wsqId = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of hardware reference by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getWsHardwareDetailsByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*,
                        c.*
                    FROM
                        tbl_hardware AS a
                    INNER JOIN
                        tbl_qtywshardware AS b
                        ON
                            a.hw_id = b.qtyhard_hwId
                    LEFT JOIN
                        tbl_brand AS c
                        ON
                            c.brand_id = b.qtyhard_brandId
                    WHERE
                        b.qtyhard_id = ?`;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get hardware details of a quarterly workstation by hardware id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfMissingActiveHardwareByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.hw_id,
                        a.hw_name,
                        a.hw_description,
                        a.hw_isActive,
                        a.hw_isOthers
                    FROM
                        tbl_hardware AS a
                    WHERE NOT EXISTS (
                                        SELECT
                                            b.qtyhard_id
                                        FROM
                                            tbl_qtywshardware AS b
                                        WHERE
                                            b.qtyhard_wsqId = ? AND
                                            a.hw_id = b.qtyhard_hwId
                                    ) AND 
                                    a.hw_isActive = ? AND
                                    a.hw_isOthers = ? 
                                        `;
    
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of missing hardware of a quarterly workstation by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getInventoryHardwareReportBySchedIdAndMonthRanges = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        f.hw_id,
                        f.hw_name,
                        COUNT(e.qtyhard_status) AS totalCount,
                        SUM(CASE WHEN e.qtyhard_status = 1 THEN 1 ELSE 0 END) AS Ok,
                        SUM(CASE WHEN e.qtyhard_status = 3 THEN 1 ELSE 0 END) AS Defective
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
                        tbl_qtywshardware AS e
                        ON
                            e.qtyhard_wsqId = d.wsq_id
                    INNER JOIN
                        tbl_hardware AS f
                        ON
                            f.hw_id = e.qtyhard_hwId
                    WHERE
                        a.sched_id = ? AND
                        c.quarter_monthlyQuarter BETWEEN ? AND ?
                    GROUP BY
                        f.hw_id
                    ORDER BY
                        f.hw_name`;
    
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get hardware inventory by sched id and month ranges in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getInventoryHardwareReportBySchedIdMonthRangesAndItemIds = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        f.hw_id,
                        f.hw_name,
                        COUNT(e.qtyhard_status) AS totalCount,
                        SUM(CASE WHEN e.qtyhard_status = 1 THEN 1 ELSE 0 END) AS Ok,
                        SUM(CASE WHEN e.qtyhard_status = 2 THEN 1 ELSE 0 END) AS Defective,
                        SUM(CASE WHEN e.qtyhard_status = 3 THEN 1 ELSE 0 END) AS Na
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
                        tbl_qtywshardware AS e
                        ON
                            e.qtyhard_wsqId = d.wsq_id
                    INNER JOIN
                        tbl_hardware AS f
                        ON
                            f.hw_id = e.qtyhard_hwId
                    WHERE
                        a.sched_id = ? AND
                        f.hw_id IN (?) AND
                        c.quarter_monthlyQuarter BETWEEN ? AND ?
                    GROUP BY
                        f.hw_id
                    ORDER BY
                        f.hw_name`;
    
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get hardware inventory by sched id, item ids and month ranges in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIds = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        f.hw_id,
                        f.hw_name,
                        g.brand_id,
                        g.brand_name,
                        d.wsq_status,
                        COUNT(e.qtyhard_status) AS totalCount,
                        SUM(CASE WHEN e.qtyhard_status = 1 THEN 1 ELSE 0 END) AS Ok,
                        SUM(CASE WHEN e.qtyhard_status = 2 THEN 1 ELSE 0 END) AS Defective,
                        SUM(CASE WHEN e.qtyhard_status = 3 THEN 1 ELSE 0 END) AS Na
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
                        tbl_qtywshardware AS e
                        ON
                            e.qtyhard_wsqId = d.wsq_id
                    INNER JOIN
                        tbl_hardware AS f
                        ON
                            f.hw_id = e.qtyhard_hwId
                    LEFT JOIN
                        tbl_brand AS g
                        ON
                            g.brand_id = e.qtyhard_brandId
                    WHERE
                        a.sched_id = ? AND
                        f.hw_id IN (?) AND
                        c.quarter_monthlyQuarter BETWEEN ? AND ?
                    GROUP BY
                        f.hw_id,
                        g.brand_id,
                        d.wsq_status
                    ORDER BY
                        f.hw_name`;
    
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get hardware inventory by sched id, item ids and month ranges in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getInventoryHardwareReportBySchedIdMonthRangesWsqStatusAndItemIdsV2 = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        f.hw_id,
                        f.hw_name,
                        g.brand_id,
                        g.brand_name,
                        d.wsq_id,
                        d.wsq_status,
                        d.wsq_resolution,
                        d.wsq_wsId,
                        e.qtyhard_hwId,
                        c.quarter_monthlyQuarter,
                        e.qtyhard_status,
                        IF(e.qtyhard_status = 1, 1, 0) AS Ok,
                        IF(e.qtyhard_status = 2, 1, 0) AS Defective,
                        IF(e.qtyhard_status = 3, 1, 0) AS Na
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
                        tbl_qtywshardware AS e
                        ON
                            e.qtyhard_wsqId = d.wsq_id
                    INNER JOIN
                        tbl_hardware AS f
                        ON
                            f.hw_id = e.qtyhard_hwId
                    LEFT JOIN
                        tbl_brand AS g
                        ON
                            g.brand_id = e.qtyhard_brandId
                    WHERE
                        a.sched_id = ? AND
                        f.hw_id IN (?) AND
                        d.wsq_resolution = ? AND
                        d.wsq_status = ? AND
                        (c.quarter_monthlyQuarter BETWEEN ? AND ?)
                    ORDER BY
                        d.wsq_wsId,
                        c.quarter_monthlyQuarter,
                        f.hw_id`;
    
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get hardware inventory by sched id, item ids and month ranges in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfMissingActiveHardwareWithOthersByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.hw_id,
                        a.hw_name,
                        a.hw_description,
                        a.hw_isActive,
                        a.hw_isOthers
                    FROM
                        tbl_hardware AS a
                    INNER JOIN
                        tbl_hardwarereference AS c 
                            ON 
                                a.hw_Id = c.refhw_hwId 
                                AND c.refhw_wsqId = ?
                    WHERE
                        a.hw_id NOT IN (
                                            SELECT
                                                b.qtyhard_hwId
                                            FROM
                                                tbl_qtywshardware AS b
                                            WHERE
                                                b.qtyhard_wsqId = ? AND
                                                a.hw_id = b.qtyhard_hwId AND
                                                a.hw_isActive = ?
                                        )
                    UNION
                        (
                            SELECT
                                a.hw_id,
                                a.hw_name,
                                a.hw_description,
                                a.hw_isActive,
                                a.hw_isOthers
                            FROM
                                tbl_hardware AS a
                            WHERE NOT EXISTS (
                                                SELECT
                                                    b.qtyhard_id
                                                FROM
                                                    tbl_qtywshardware AS b
                                                WHERE
                                                    b.qtyhard_wsqId = ? AND
                                                    a.hw_id = b.qtyhard_hwId
                                            ) AND 
                                            a.hw_isActive = ? AND
                                            a.hw_isOthers = ? 
                        )
                                        `;
    
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of missing hardware of a quarterly workstation by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfHardwareWithRange = (data) => {
    var where_SQL = ``;
    var params = {
        pFrom: data.pFrom,
        pTo: data.pTo
    };

    if(data.hw_isActive != null && data.hw_isActive != ""){
        where_SQL += `AND hw_isActive = ${data.hw_isActive} `;
    }

    if(data.hw_isOthers != null && data.hw_isOthers != ""){
        where_SQL += `AND hw_isOthers = ${data.hw_isOthers} `;
    }

    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                   FROM
                        tbl_hardware
                   WHERE
                        hw_name LIKE N'%${data.hw_name}%' AND
                        hw_description LIKE N'%${data.hw_description}%'
                        ${where_SQL}
                   LIMIT 
                        ?, ?`;

        let values = Object.values(params);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of hardware with range limits in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.checkHardwareExistsOnOtherTables = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                    (SELECT CASE WHEN EXISTS(SELECT * FROM tbl_qtywshardware WHERE qtyhard_hwId = ?) THEN 1 ELSE 0 END) AS isExistsInQtyHw,
                    (SELECT CASE WHEN EXISTS(SELECT * FROM tbl_hardwarereference WHERE refhw_hwId = ?) THEN 1 ELSE 0 END) AS isExistsInHwRef;
                    `;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to if hardware exists under tbl_qtywshardware in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}
