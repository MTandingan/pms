const Constants = require('../helper/constants');
const { conn } = require("../db/dbconfig");

//-------------------- CREATE --------------------//
module.exports.createWorkStation = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_workstation (ws_compId,
                                                ws_userId,
                                                ws_userName,
                                                ws_computerName,
                                                ws_location,
                                                ws_ipAddress,
                                                ws_isActive,
                                                ws_ipType) 
                                                VALUES (?,?,?,?,?,?,?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create workstation in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- GET --------------------//
module.exports.getListOfWorkstations = () => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_workstation`;
                        
        conn.query(sql, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all workstations in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfWorkstationsByStatus = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_workstation
                    WHERE
                        ws_isActive = ?`;
        
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all workstations by status in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getWorkstationAndComputerByWsId = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*
                    FROM
                        tbl_workstation AS a
                    INNER JOIN
                        tbl_computer AS b
                        ON
                            a.ws_compId = b.comp_id
                    WHERE
                        a.ws_id = ?`;
        
        let values = Object.values(data);              
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get workstation and computer by workstation id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getWorkstationById = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_workstation
                    WHERE
                        ws_id = ?`;
        
        let values = Object.values(data);              
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get workstation in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfUserWorkstationWithRange = (data) => {
    var where_SQL = ``;
    var params = {
        pFrom: data.pFrom,
        pTo: data.pTo
    };

    if(data.access_right === Constants.ROLE_COMMON_USER){
        where_SQL += `AND a.ws_userId = ${data.ws_userId} `;
    }

    if(data.sched_year !== 0 && data.sched_year !== null){
        where_SQL += `AND f.sched_year = ${data.sched_year} `;
    }

    if(data.pdept_batch !== 0 && data.pdept_batch !== null){
        where_SQL += `AND e.pdept_batch = ${data.pdept_batch} `;
    }

    if(data.wsq_status !== 0 && data.wsq_status !== null){
        where_SQL += `AND c.wsq_status = ${data.wsq_status} `;
    }

    if(data.wsq_id !== 0 && data.wsq_id !== null){
        where_SQL += `AND c.wsq_id = ${data.wsq_id} `;
    }

    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*,
                        c.*,
                        d.*,
                        e.*,
                        f.*,
                        g.*
                   FROM
                        tbl_workstation AS a
                   INNER JOIN
                        tbl_computer AS b
                        ON
                            b.comp_id = a.ws_compId
                   INNER JOIN
                        tbl_workstationquarterly AS c
                        ON
                            a.ws_id = c.wsq_wsId
                   INNER JOIN
                        tbl_quarter AS d
                        ON
                            d.quarter_id = c.wsq_quarterId 
                   INNER JOIN
                        tbl_department AS e
                        ON
                            e.pdept_id = d.quarter_pDeptId
                   INNER JOIN
                        tbl_schedule AS f
                        ON
                            f.sched_id = e.pdept_schedId    
                   INNER JOIN
                        tbl_location AS g
                        ON
                            g.location_id = e.pdept_locationId               
                   WHERE
                        a.ws_computerName LIKE N'%${data.ws_computerName}%' AND
                        g.location_name LIKE N'%${data.location_name}%' AND
                        a.ws_userName LIKE N'%${data.ws_userName}%'
                        ${where_SQL}
                   ORDER BY
                        a.ws_id DESC
                   LIMIT 
                        ?, ?`;

        let values = Object.values(params);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of workstation of user with range limits in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfUserOthersWorkstationWithRange = (data) => {
    var where_SQL = ``;
    var params = {
        pFrom: data.pFrom,
        pTo: data.pTo
    };

    if(data.sched_year !== 0 && data.sched_year !== null){
        where_SQL += `AND f.sched_year = ${data.sched_year} `;
    }

    if(data.pdept_batch !== 0 && data.pdept_batch !== null){
        where_SQL += `AND e.pdept_batch = ${data.pdept_batch} `;
    }

    if(data.wsq_status !== 0 && data.wsq_status !== null){
        where_SQL += `AND c.wsq_status = ${data.wsq_status} `;
    }

    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*,
                        c.*,
                        d.*,
                        e.*,
                        f.*,
                        g.*
                   FROM
                        tbl_workstation AS a
                   INNER JOIN
                        tbl_computer AS b
                        ON
                            b.comp_id = a.ws_compId
                   INNER JOIN
                        tbl_workstationquarterly AS c
                        ON
                            a.ws_id = c.wsq_wsId
                   INNER JOIN
                        tbl_quarter AS d
                        ON
                            d.quarter_id = c.wsq_quarterId 
                   INNER JOIN
                        tbl_department AS e
                        ON
                            e.pdept_id = d.quarter_pDeptId
                   INNER JOIN
                        tbl_schedule AS f
                        ON
                            f.sched_id = e.pdept_schedId    
                   INNER JOIN
                        tbl_location AS g
                        ON
                            g.location_id = e.pdept_locationId
                   INNER JOIN
                        tbl_userworkstationrights AS h
                        ON
                            c.wsq_id = h.wsqRights_wsqId              
                   WHERE
                        a.ws_computerName LIKE N'%${data.ws_computerName}%' AND
                        g.location_name LIKE N'%${data.location_name}%' AND
                        a.ws_userName LIKE N'%${data.ws_userName}%' AND 
                        h.wsqRights_userId = ${data.ws_userId} 
                        ${where_SQL}
                   ORDER BY
                        a.ws_id DESC
                   LIMIT 
                        ?, ?`;

        let values = Object.values(params);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of workstation of user with range limits in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfUserWorkstationDeviceWithRange = (data) => {
    var where_SQL = ``;
    var params = {
        pFrom: data.pFrom,
        pTo: data.pTo
    };

    if(data.ws_userId !== 0 && data.ws_userId !== null){
        where_SQL += `AND a.ws_userId = ${data.ws_userId} `;
    }

    if(data.ws_isActive !== '' && data.ws_isActive !== null){
        where_SQL += `AND a.ws_isActive = ${data.ws_isActive} `;
    }

    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        a.*,
                        b.*
                   FROM
                        tbl_workstation AS a       
                   INNER JOIN
                        tbl_computer AS b
                        ON
                            a.ws_compId = b.comp_id  
                   WHERE
                        a.ws_id != 0
                        ${where_SQL}
                   LIMIT 
                        ?, ?`;

        let values = Object.values(params);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of workstation of user device with range limits in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- UPDATE --------------------//
module.exports.updateWorkstationStatus = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_workstation 
                   SET
                        ws_isActive = ?
                   WHERE
                        ws_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update workstation status by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}


