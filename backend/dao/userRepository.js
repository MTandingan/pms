const { conn } = require("../db/dbconfig");
const { conn_pis } = require("../db/dbconfig");

//-------------------- GET --------------------//
module.exports.login = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT 
                        e.id, 
                        e.dept_section, 
                        e.fname, 
                        e.mname, 
                        e.lname, 
                        e.ext_name, 
                        e.dept_id, 
                        dp.dept_code, 
                        dp.dept_name,
                        dp.dept_div, 
                        e.designation_id, 
                        ds.designation_code, 
                        ds.designation_name, 
                        sa.access_right
                    FROM 
                        employees e 
                    LEFT JOIN 
                        departments dp
                        ON 
                            dp.id = e.dept_id 
                    LEFT JOIN 
                        designations ds
                        ON 
                            ds.id = e.designation_id
                    LEFT JOIN 
                        system_access sa 
                        ON 
                            sa.employee_id = e.id AND sa.system_id = ?
                    WHERE 
                        e.username = ? AND 
                        e.password = MD5(?) AND 
                        e.status = 1`;
                        
        let values = Object.values(data);
        conn_pis.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get user on CAMS by username, password and system id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}