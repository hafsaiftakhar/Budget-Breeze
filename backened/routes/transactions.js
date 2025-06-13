const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ✅ GET route for fetching transactions
router.get('/', (req, res) => {
  const query = "SELECT * FROM record ORDER BY date DESC";

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ error: 'Database fetch failed' });
    }

    res.json(results);
  });
});

// ✅ POST route for adding transactions
router.post('/', (req, res) => {
  const { type, amount, category } = req.body;

  if (!type || !amount || !category) {
    return res.status(400).json({ error: 'Type, amount, and category are required' });
  }

  const query = "INSERT INTO record (type, amount, category, date) VALUES (?, ?, ?, CURDATE())";

  db.query(query, [type, amount, category], (error, results) => {
    if (error) {
      console.error('Error inserting transaction:', error);
      return res.status(500).json({ error: 'Database insert failed' });
    }

    res.json({ id: results.insertId, message: 'Transaction saved' });
  });
});

module.exports = router;
