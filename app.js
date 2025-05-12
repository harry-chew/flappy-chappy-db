const express = require('express');
const mysql = require('mysql2');

const app = express();

app.use(express.json());

const DB_HOST = process.env === 'production'? process.env.DB_HOST : process.env.DEV_DB_HOST;
const DB_USER = process.env === 'production'? process.env.DB_USER : process.env.DEV_DB_USER;
const DB_PASS = process.env === 'production'? process.env.DB_PASS : process.env.DEV_DB_PASS;
const DB_NAME = process.env === 'production'? process.env.DB_NAME : process.env.DEV_DB_NAME;

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
    return;
  }
  console.log('Successfully connected to the database.');
  connection.release();
});

app.get('/hiscores', (req, res) => {
  // Use the pool to query the database
  pool.query('SELECT * FROM hiscores ORDER BY score DESC LIMIT 100', (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error fetching high scores' });
    }
    res.json(results);
  });
});

app.post('/hiscores', (req, res) => {
    const { player, score } = req.body;
    console.log(`Saving high score for ${player}: ${score}`);
    if (!player || !score) {
      return res.status(400).json({ error: 'Name and score are required' });
    }
    pool.query(
      'INSERT INTO hiscores (player, score) VALUES (?,?)',
      [player, score],
      (error, results) => {
        if (error) {
            console.error('Error saving high score:', error);
            return res.status(500).json({ error: 'Error saving high score' });
        }
        console.log(`High score saved for ${player}: ${score}`);
        res.status(201).json(results);
      });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
