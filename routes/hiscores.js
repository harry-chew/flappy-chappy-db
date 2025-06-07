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
  const { player, score, uuid } = req.body;
  if (!player || !score || !uuid) {
    console.error('Missing player or score or uuid in request body');
    return res.status(400).json({ error: 'Player and score are required' });
  }
  try {

    // Check if the player already has a high score
    const [existing] = await pool.promise().query(
      'SELECT * FROM hiscores WHERE uuid = ?',
      [uuid]
    );

    if (existing.length > 0) {
      console.log(existing);
      // If the player exists, update their score if the new score is higher
      if (existing[0].score >= score) {
        return res.status(400).json({ error: 'Score must be higher than the existing score' });
      }
      console.log(`Updating high score for ${player}: ${score}`);
      const [update] = await pool.promise().query(
        'UPDATE hiscores SET score = ?, player = ? WHERE uuid = ?',
        [score, player, uuid]
      );
      if (update.affectedRows === 0) {
        return res.status(400).json({ error: 'Failed to update score' });
      }
      return res.status(200).json({ message: 'Score updated successfully' });
    }

    console.log(`Saving high score for ${player}: ${score}`);
    const [result] = await pool.promise().query(
      'INSERT INTO hiscores (player, score, uuid) VALUES (?, ?, ?)',
      [player, score, uuid]
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