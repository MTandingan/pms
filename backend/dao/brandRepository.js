const { conn } = require("../db/dbconfig");

//-------------------- CREATE --------------------//
module.exports.createBrand = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO tbl_brand (brand_name,
                                          brand_description,
                                          brand_isActive,
                                          brand_serial) 
                                        VALUES (?,?,?,?)`;
                                            
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to create brand in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- UPDATE --------------------//
module.exports.updateBrand = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE 
                        tbl_brand
                   SET
                        brand_name = ?,
                        brand_description = ?,
                        brand_isActive = ?,
                        brand_serial = ?
                   WHERE
                        brand_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to update brand by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- DELETE --------------------//
module.exports.deleteBrand = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM
                        tbl_brand
                   WHERE
                        brand_id = ?`;
        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to delete brand by id in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

//-------------------- GET --------------------//
module.exports.getListOfBrand = () => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                    FROM
                        tbl_brand`;
                        
        conn.query(sql, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of all brand in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}

module.exports.getListOfBrandWithRange = (data) => {
    var where_SQL = ``;
    var params = {
        pFrom: data.pFrom,
        pTo: data.pTo
    };

    if(data.brand_isActive != null && data.brand_isActive != ""){
        where_SQL += `AND brand_isActive = ${data.brand_isActive} `;
    }

    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                   FROM
                        tbl_brand
                   WHERE
                        brand_name LIKE N'%${data.brand_name}%' AND
                        brand_description LIKE N'%${data.brand_description}%' AND
                        brand_serial LIKE N'%${data.brand_serial}%' 
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

module.exports.getListOfBrandByStatus = (data) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT
                        *
                   FROM
                        tbl_brand
                   WHERE
                        brand_isActive = ?`;

        let values = Object.values(data);
        conn.query(sql, values, (err, results) => {
            if(err){
                reject(new Error('Failed to get list of brand by status in DB - ' + err.message));
            }

            resolve(results);
        });
    });
}