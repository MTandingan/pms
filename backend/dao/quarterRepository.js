const { conn } = require("../db/dbconfig");

//-------------------- CREATE --------------------//
module.exports.createQuarter = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_quarter (quarter_pDeptId ,
                                            quarter_monthlyQuarter,
                                            quarter_numPlanned,
                                            quarter_numActual,
                                            quarter_numDeferred) 
                                            VALUES (?,?,?,?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create quarter in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.createWorkstationForQuarterly = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_workstationquarterly (wsq_quarterId,
                                                         wsq_wsId,
                                                         wsq_checkedBy,
                                                         wsq_checkedByUserName,
                                                         wsq_checkedAt,
                                                         wsq_acknowledgedBy,
                                                         wsq_acknowledgedByUserName,
                                                         wsq_acknowledgedAt,
                                                         wsq_status) 
                                            VALUES (?,?,?,?,?,?,?,?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create workstation for quarterly in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- UPDATE --------------------//
module.exports.updateQuarterlyWorkstationStatusById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_workstationquarterly 
                   SET
                        wsq_status = ?
                   WHERE
                        wsq_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update quarterly workstation status by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateQuarterlyWorkstationRemarks = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_workstationquarterly 
                   SET
                        wsq_remarks = ?
                   WHERE
                        wsq_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update quarterly workstation remarks by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateQuarterlyWorkstationStatusAndResolutionById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_workstationquarterly 
                   SET
                        wsq_status = ?,
                        wsq_resolution = ?
                   WHERE
                        wsq_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update quarterly workstation status and resolution by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateQuarterlyWorkstationCheckedbyById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_workstationquarterly 
                   SET
                        wsq_checkedBy = ?,
                        wsq_checkedByUserName = ?,
                        wsq_checkedAt = ?
                   WHERE
                        wsq_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update quarterly workstation checkedby data by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateQuarterlyWorkstationAcknowledgedbyById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_workstationquarterly 
                   SET
                        wsq_acknowledgedBy = ?,
                        wsq_acknowledgedByUserName = ?,
                        wsq_acknowledgedAt = ?
                   WHERE
                        wsq_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update quarterly workstation acknowledgedby data by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateWsq = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_workstationquarterly 
                   SET
                        wsq_checkedBy = ?,
                        wsq_checkedByUserName = ?,
                        wsq_checkedAt = ?,
                        wsq_acknowledgedBy = ?,
                        wsq_acknowledgedByUserName = ?,
                        wsq_acknowledgedAt = ?,
                        wsq_status = ?,
                        wsq_resolution = ?,
                        wsq_remarks = ?
                   WHERE
                        wsq_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update quarterly workstation by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateQuarterActual = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_quarter 
                   SET
                        quarter_numActual = ?
                   WHERE
                        quarter_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update actual number of a quarter by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateQuarterDeferred = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_quarter 
                   SET
                        quarter_numDeferred = ?
                   WHERE
                        quarter_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update deferred number of a quarter by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateQuarterPlanned = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_quarter 
                   SET
                        quarter_numPlanned = ?
                   WHERE
                        quarter_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update planned number of a quarter by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateQuarterDataByQuarterId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_quarter 
                   SET
                        quarter_numPlanned = ?,
                        quarter_numActual = ?,
                        quarter_numDeferred = ?
                   WHERE
                        quarter_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update quarter data by quarter by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.updateConductedByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_workstationquarterly 
                   SET
                        wsq_hasConducted = ?
                   WHERE
                        wsq_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update hasConducted of quarter by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- DELETE --------------------//
module.exports.deleteWorkstationQuarterlyById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_workstationquarterly
                   WHERE
                        wsq_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete quarterly workstation by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.deleteQuarterByDeptId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_quarter
                   WHERE
                        quarter_pDeptId = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete quarter data by dept id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- GET --------------------//
module.exports.getQuarter = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_quarter
                    WHERE
                        quarter_id = ?`

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get quarter by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfQuarterlyByYearAndMonth = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        b.pdept_id,
                        b.pdept_locationId,
                        c.quarter_id,
                        c.quarter_numPlanned,
                        c.quarter_numActual,
                        c.quarter_numDeferred,
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
                            b.pdept_id = c.quarter_pDeptId
                    INNER JOIN
                        tbl_location AS d
                        ON
                            d.location_id = b.pdept_locationId
                    WHERE
                        a.sched_year = ? AND
                        c.quarter_monthlyQuarter = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of departments quarterly by year and month in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfQuarterlyByYear = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        b.pdept_id,
                        b.pdept_locationId,
                        c.quarter_id,
                        c.quarter_numPlanned,
                        c.quarter_numActual,
                        c.quarter_numDeferred,
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
                            b.pdept_id = c.quarter_pDeptId
                    INNER JOIN
                        tbl_location AS d
                        ON
                            d.location_id = b.pdept_locationId
                    WHERE
                        a.sched_year = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of departments quarterly by year in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfQuarterlyBySchedId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.pdept_id,
                        b.pdept_locationId,
                        c.quarter_id,
                        c.quarter_numPlanned,
                        c.quarter_numActual,
                        c.quarter_numDeferred,
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
                            b.pdept_id = c.quarter_pDeptId
                    INNER JOIN
                        tbl_location AS d
                            d.location_id = b.pdept_locationId
                    WHERE
                        a.sched_id = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of departments quarterly by sched id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfQuarterlyFirstQuarterBySchedId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        b.pdept_id,
                        b.pdept_locationId,
                        c.quarter_id,
                        c.quarter_numPlanned,
                        c.quarter_numActual,
                        c.quarter_numDeferred,
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
                            b.pdept_id = c.quarter_pDeptId
                    INNER JOIN
                        tbl_location AS d
                        ON
                            d.location_id = b.pdept_locationId
                    WHERE
                        a.sched_id = ? AND
                        c.quarter_monthlyQuarter IN (1, 2, 3)`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of departments quarterly by sched id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getDepartmentAndQuarterlyDetailsById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.pdept_id,
                        a.pdept_locationId,
                        a.pdept_schedId,
                        b.*,
                        c.sched_year,
                        d.*
                    FROM
                        tbl_department AS a
                    INNER JOIN
                        tbl_quarter AS b
                        ON
                            a.pdept_id = b.quarter_pDeptId
                    INNER JOIN
                        tbl_schedule AS c
                        ON
                            c.sched_id = a.pdept_schedId
                    INNER JOIN
                        tbl_location AS d
                        ON
                            d.location_id = a.pdept_locationId
                    WHERE
                        b.quarter_id = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get department and quarterly details by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getDepartmentWorkstationQuarterlyDetailsByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*,
                        c.sched_year,
                        d.*,
                        e.*,
                        f.*,
                        g.*
                    FROM
                        tbl_department AS a
                    INNER JOIN
                        tbl_quarter AS b
                        ON
                            a.pdept_id = b.quarter_pDeptId
                    INNER JOIN
                        tbl_schedule AS c
                        ON
                            c.sched_id = a.pdept_schedId
                    INNER JOIN
                        tbl_workstationquarterly AS d
                        ON
                            d.wsq_quarterId = b.quarter_id
                    INNER JOIN  
                        tbl_workstation AS e
                        ON
                            e.ws_id = d.wsq_wsId
                    INNER JOIN  
                        tbl_computer AS f
                        ON
                            e.ws_compId = f.comp_id 
                    INNER JOIN
                        tbl_location AS g
                        ON
                            g.location_id = a.pdept_locationId
                    WHERE
                        d.wsq_id = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get all the details by wsq id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfQuarterlyWorkstationById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*,
                        c.*
                    FROM
                        tbl_workstationquarterly AS a
                    INNER JOIN
                        tbl_workstation AS b
                        ON
                            a.wsq_wsId = b.ws_id
                    INNER JOIN
                        tbl_computer AS c
                        ON
                            c.comp_id = b.ws_compId
                    WHERE
                        a.wsq_quarterId = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the quarterly workstations by quarter id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getQuarterlyWorkstationAndCompByWsqId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*,
                        c.*
                    FROM
                        tbl_workstationquarterly AS a
                    INNER JOIN
                        tbl_workstation AS b
                        ON
                            a.wsq_wsId = b.ws_id
                    INNER JOIN
                        tbl_computer AS c
                        ON
                            c.comp_id = b.ws_compId
                    WHERE
                        a.wsq_id = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the quarterly workstations by quarter id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfQuarterlyWorkstationOnlyById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_workstationquarterly
                    WHERE
                        wsq_quarterId = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the quarterly workstations only by quarter id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfQuarterlyWorkstationOnlyByIdWithStatusAndReso = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_workstationquarterly
                    WHERE
                        wsq_quarterId = ? AND
                        wsq_status = ? AND
                        wsq_resolution = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the quarterly workstations only by quarter id, status and resolution in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfQuarterlyWorkstationByCompIdAndNotStatus = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*
                    FROM
                        tbl_workstationquarterly AS a
                    INNER JOIN
                        tbl_workstation AS b
                        ON
                            a.wsq_wsId = b.ws_id
                    WHERE
                        b.ws_compId = ? AND
                        a.wsq_status != ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the quarterly workstations by computer id and wsq status in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfQuarterlyWorkstationOnlyByIdAndStatus = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_workstationquarterly
                    WHERE
                        wsq_quarterId = ? AND
                        wsq_status = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the quarterly workstations only by quarter id and status in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getQuarterlyWorkstationByQuarterIdAndWorkstationId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_workstationquarterly
                    WHERE
                        wsq_quarterId = ? AND
                        wsq_wsId = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the quarterly workstation by quarter id and workstation id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getQuarterlyWorkstationOnly = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_workstationquarterly
                    WHERE
                        wsq_id = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the quarterly workstation only by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getQuarterlyWorkstationByDeptDetailsAndMonth = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        d.ws_computerName,
                        d.ws_userId,
                        d.ws_userName
                    FROM
                        tbl_workstationquarterly AS a
                    INNER JOIN
                        tbl_quarter AS b
                        ON
                            a.wsq_quarterId = b.quarter_id
                    INNER JOIN
                        tbl_department AS c
                        ON
                            c.pdept_id = b.quarter_pDeptId
                    INNER JOIN
                        tbl_workstation AS d
                        ON
                            d.ws_id = a.wsq_wsId
                    WHERE
                        c.pdept_schedId = ? AND
                        c.pdept_locationId = ? AND
                        b.quarter_monthlyQuarter = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the quarterly workstation by department details and quarterly month in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getQuarterlyWorkstationAndWsOnly = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*
                    FROM
                        tbl_workstationquarterly AS a
                    INNER JOIN
                        tbl_workstation AS b
                        ON
                            a.wsq_wsId = b.ws_id
                    WHERE
                        a.wsq_id = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the quarterly workstation only by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getQuarterByPmsDeptIdAndMonthlyQuarter = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_quarter
                    WHERE
                        quarter_pDeptId = ? AND
                        quarter_monthlyQuarter = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the quarter by id and pdept id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getQuarterByPmsDeptId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_quarter
                    WHERE
                        quarter_pDeptId = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the quarter by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getQuarterByPmsDeptIdMonthlyQuarterAndLastQuarter = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*
                    FROM
                        tbl_quarter AS a
                    INNER JOIN
                        tbl_department AS b
                        ON
                            b.pdept_id = a.quarter_pDeptId 
                    WHERE
                        b.pdept_schedId = ? AND
                        b.pdept_locationId = ? AND
                        a.quarter_monthlyQuarter IN (10, 11, 12)`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the quarter by sched id, dept id and last quarter as monthly quarter in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getFirstQuarterlyWorkstationByYearAndDeptId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.pdept_id,
                        b.pdept_locationId,
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
                            b.pdept_id = c.quarter_pDeptId
                    INNER JOIN
                        tbl_location AS d
                        ON
                            d.location_id = b.pdept_locationId
                    WHERE
                        a.sched_year = ? AND
                        b.pdept_locationId = ? AND
                        c.quarter_monthlyQuarter IN (1, 2, 3)`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the first quarterly workstation by year and dept id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getFirstQuarterlyWorkstationBySchedIdAndDeptId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.pdept_id,
                        b.pdept_locationId,
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
                            b.pdept_id = c.quarter_pDeptId
                    INNER JOIN
                        tbl_location AS d
                        ON
                            d.location_id = b.pdept_locationId
                    WHERE
                        a.sched_id = ? AND
                        b.pdept_locationId = ? AND
                        c.quarter_monthlyQuarter IN (1, 2, 3)`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the first quarterly workstation by year and dept id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getFourthQuarterlyWorkstationByYearAndDeptId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.pdept_id,
                        b.pdept_locationId,
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
                            b.pdept_id = c.quarter_pDeptId
                    INNER JOIN
                        tbl_location AS d
                        ON
                            d.location_id = b.pdept_locationId
                    WHERE
                        a.sched_year = ? AND
                        b.pdept_locationId = ? AND
                        c.quarter_monthlyQuarter IN (10, 11, 12)`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the fourth quarterly workstation by year and dept id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfQuarterlyWorkstationBySchedIdAndMonthlyQuarters = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        b.*,
                        c.*,
                        d.*,
                        e.*
                    FROM
                        tbl_schedule AS a
                    INNER JOIN
                        tbl_department AS b
                        ON
                            a.sched_id = b.pdept_schedId
                    INNER JOIN
                        tbl_quarter AS c
                        ON
                            b.pdept_id = c.quarter_pDeptId
                    INNER JOIN
                        tbl_workstationquarterly AS d
                        ON
                            c.quarter_id = d.wsq_quarterId
                    INNER JOIN
                        tbl_workstation AS e
                        ON
                            e.ws_id = d.wsq_wsId
                    WHERE
                        a.sched_id = ? AND
                        c.quarter_monthlyQuarter IN (?, ?, ?)`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get the list of quarterly workstations by sched id and monthly order positions in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.checkWorkstationIsCompleteBySchedId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                    exists(
                        SELECT 
                            c.* 
                        FROM 
                            tbl_workstationquarterly AS a
                        INNER JOIN
                            tbl_quarter AS b
                            ON
                                a.wsq_quarterId = b.quarter_id
                        INNER JOIN
                            tbl_department AS c
                            ON
                                b.quarter_pDeptId = c.pdept_id
                        WHERE 
                            c.pdept_schedId = ? AND
                            a.wsq_wsId = ?
                    ) AS isExists
                    `;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to check if workstation is complete in sched id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfWorkstationsByQtrStatusAndSchedId = (data) => {
    var params = {
        sched_id: data.sched_id,
        wsq_status: data.wsq_status
    };

    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        c.* 
                    FROM 
                        tbl_workstationquarterly AS a
                    INNER JOIN
                        tbl_quarter AS b
                        ON
                            a.wsq_quarterId = b.quarter_id
                    INNER JOIN
                        tbl_department AS c
                        ON
                            b.quarter_pDeptId = c.pdept_id
                    WHERE 
                        c.pdept_schedId = ? AND 
                        a.wsq_status = ? AND 
                        a.wsq_wsId IN (${data.listOfWorkstationsString})
                    `;
                        
        let values = Object.values(params);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of workstations by status and sched id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfWorkstationsByQtrNotStatusAndSchedId = (data) => {
    var params = {
        sched_id: data.sched_id,
        wsq_status: data.wsq_status
    };

    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        d.*
                    FROM 
                        tbl_workstationquarterly AS a
                    INNER JOIN
                        tbl_workstation AS d
                        ON
                            a.wsq_wsId = d.ws_id
                    INNER JOIN
                        tbl_quarter AS b
                        ON
                            a.wsq_quarterId = b.quarter_id
                    INNER JOIN
                        tbl_department AS c
                        ON
                            b.quarter_pDeptId = c.pdept_id
                    WHERE 
                        c.pdept_schedId = ? AND 
                        a.wsq_status != ? AND 
                        a.wsq_wsId IN (${data.listOfWorkstationsString})
                    `;
                        
        let values = Object.values(params);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of workstations by NOT status and sched id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getQuarterlyWorkstationDetailsByWsqIds = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.wsq_id,
                        d.ws_userName,
                        d.ws_computerName,
                        b.quarter_monthlyQuarter,
                        e.location_name,
                        CASE 
                            WHEN b.quarter_monthlyQuarter = 0 THEN 'January'
                            WHEN b.quarter_monthlyQuarter = 1 THEN 'February'
                            WHEN b.quarter_monthlyQuarter = 2 THEN 'March'
                            WHEN b.quarter_monthlyQuarter = 3 THEN 'April'
                            WHEN b.quarter_monthlyQuarter = 4 THEN 'May'
                            WHEN b.quarter_monthlyQuarter = 5 THEN 'June'
                            WHEN b.quarter_monthlyQuarter = 6 THEN 'July'
                            WHEN b.quarter_monthlyQuarter = 7 THEN 'August'
                            WHEN b.quarter_monthlyQuarter = 8 THEN 'September'
                            WHEN b.quarter_monthlyQuarter = 9 THEN 'October'
                            WHEN b.quarter_monthlyQuarter = 10 THEN 'November'
                            WHEN b.quarter_monthlyQuarter = 11 THEN 'December'
                            ELSE 'Invalid Month'
                        END AS month_name
                    FROM 
                        tbl_workstationquarterly AS a
                    INNER JOIN
                        tbl_workstation AS d
                        ON
                            a.wsq_wsId = d.ws_id
                    INNER JOIN
                        tbl_quarter AS b
                        ON
                            a.wsq_quarterId = b.quarter_id
                    INNER JOIN
                        tbl_department AS c
                        ON
                            b.quarter_pDeptId = c.pdept_id
                    INNER JOIN
                        tbl_location AS e
                        ON
                            e.location_id = c.pdept_locationId 
                    WHERE
                        a.wsq_id IN (?)
                    ORDER BY
                        b.quarter_monthlyQuarter,
                        e.location_name,
                        d.ws_userName
                    `;
                        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of workstation details by workstation ids in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}






	
	