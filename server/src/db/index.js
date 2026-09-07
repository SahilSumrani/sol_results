const mysql = require('mysql2/promise');
require('dotenv').config();

const poolLimit = parseInt(process.env.DB_POOL_LIMIT || '20', 10);

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sol_erp',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: poolLimit,
  queueLimit: 0,
  multipleStatements: true
});

async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

// Transaction wrapper helper for multi-step atomic writes
async function withTransaction(callback) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  query,
  withTransaction
};
