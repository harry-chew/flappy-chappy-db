const express = require('express');
const pool = require('../database.js');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM hiscores ORDER BY score DESC LIMIT 100');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { player, score } = req.body;
  if (!player || !score) {
    return res.status(400).json({ error: 'Player and score are required' });
  }
  try {
    console.log(`Saving high score for ${player}: ${score}`);
    const [result] = await pool.promise().query(
      'INSERT INTO hiscores (player, score) VALUES (?, ?)',
      [player, score]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Failed to save score' });
    }
    res.status(201).json({ message: 'Score saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;