const mysql = require('mysql2');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const DB_HOST = isProduction ? process.env.DB_HOST : process.env.DEV_DB_HOST;
const DB_USER = isProduction ? process.env.DB_USER : process.env.DEV_DB_USER;
const DB_PASS = isProduction ? process.env.DB_PASS : process.env.DEV_DB_PASS;
const DB_NAME = isProduction ? process.env.DB_NAME : process.env.DEV_DB_NAME;

// Check if all required environment variables are set
if (!DB_HOST || !DB_USER || !DB_PASS || !DB_NAME) {
  console.error('Error: Missing database configuration. Please check your .env file.');
  process.exit(1);
}

// Create a connection pool
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 10
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('This error may be caused by incorrect database credentials.');
      console.error('Please check your .env file for DB_USER, DB_PASS, etc.');
    }
    process.exit(1);
  }
  console.log('Successfully connected to the database.');
  connection.release();
});

module.exports = pool;