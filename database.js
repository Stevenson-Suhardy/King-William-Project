const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "user1",
  password: "password",
  database: "king_william_db",
});

module.exports = pool;
