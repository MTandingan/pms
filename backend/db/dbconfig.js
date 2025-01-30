const mysql = require("mysql");
const config = require("../config.json");

const conn = mysql.createPool({
    connectionLimit: config.connectionLimit,
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.dbname,
    timezone: config.timeZone
});

const conn_pis = mysql.createPool({
    connectionLimit: config.connectionLimit,
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.dbname_pis,
    timezone: config.timeZone
});

module.exports = { conn, conn_pis};


