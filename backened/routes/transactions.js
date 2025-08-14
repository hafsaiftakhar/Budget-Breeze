const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ---------------------------
// Ensure table exists (without DROP)
// ---------------------------
db.run(`
  CREATE TABLE IF NOT EXISTS record (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    user_id TEXT NOT NULL
  )
`);

// ---------------------------
// POST /transactions - Create a new transaction
// ---------------------------
router.post('/', (req, res) => {
  const { type, amount, category, user_id } = req.body;

  if (!type || !amount || !category || !user_id) {
    return res.status(400).json({ error: 'Type, amount, category, and user_id are required' });
  }

  const query = `INSERT INTO record (type, amount, category, date, user_id) VALUES (?, ?, ?, date('now'), ?)`;

  db.run(query, [type, amount, category, user_id], function (error) {
    if (error) {
      console.error('❌ Error inserting transaction:', error);
      return res.status(500).json({ error: 'Database insert failed' });
    }

    res.json({ id: this.lastID, message: 'Transaction saved' });
  });
});

// ---------------------------
// GET /transactions - Get all transactions for a user
// ---------------------------
router.get('/', (req, res) => {
  const userId = req.query.user_id; // consistent naming

  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  const query = `SELECT * FROM record WHERE user_id = ? ORDER BY date DESC`;

  db.all(query, [userId], (error, results) => {
    if (error) {
      console.error('❌ Error fetching transactions:', error);
      return res.status(500).json({ error: 'Failed to retrieve transactions' });
    }

    res.json(results);
  });
});

// ---------------------------
// PUT /transactions/:id - Update a transaction
// ---------------------------
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { type, amount, category, user_id } = req.body;

  if (!type || !amount || !category || !user_id) {
    return res.status(400).json({ error: 'Type, amount, category, and user_id are required' });
  }

  const query = `UPDATE record SET type = ?, amount = ?, category = ? WHERE id = ? AND user_id = ?`;

  db.run(query, [type, amount, category, id, user_id], function (err) {
    if (err) {
      console.error('❌ Error updating transaction:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found or not yours' });
    }
    res.json({ message: 'Transaction updated successfully' });
  });
});

// ---------------------------
// DELETE /transactions/:id - Delete a transaction
// ---------------------------
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const user_id = req.query.user_id || req.body.user_id; // support both query or body

  if (!user_id) return res.status(400).json({ error: 'User ID is required' });

  const query = `DELETE FROM record WHERE id = ? AND user_id = ?`;

  db.run(query, [id, user_id], function (error) {
    if (error) {
      console.error('❌ Error deleting transaction:', error);
      return res.status(500).json({ error: 'Failed to delete transaction' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found or not yours' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  });
});

module.exports = router;
