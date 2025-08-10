const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ✅ Ensure table exists
db.run(`
  CREATE TABLE IF NOT EXISTS record (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL
  )
`);

// POST /transactions - Create a new transaction
router.post('/', (req, res) => {
  const { type, amount, category } = req.body;

  if (!type || !amount || !category) {
    return res.status(400).json({ error: 'Type, amount, and category are required' });
  }

  const query = `INSERT INTO record (type, amount, category, date) VALUES (?, ?, ?, date('now'))`;

  db.run(query, [type, amount, category], function (error) {
    if (error) {
      console.error('❌ Error inserting transaction:', error);
      return res.status(500).json({ error: 'Database insert failed' });
    }

    res.json({ id: this.lastID, message: 'Transaction saved' });
  });
});

// GET /transactions - Get all transactions
router.get('/', (req, res) => {
  const query = `SELECT * FROM record ORDER BY date DESC`;

  db.all(query, [], (error, results) => {
    if (error) {
      console.error('❌ Error fetching transactions:', error);
      return res.status(500).json({ error: 'Failed to retrieve transactions' });
    }

    res.json(results);
  });
});

// PUT /transactions/:id - Update a transaction
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { amount, category, type } = req.body;

  if (!amount || !category || !type) {
    return res.status(400).json({ error: 'Amount, category, and type are required' });
  }

  const query = `UPDATE record SET amount = ?, category = ?, type = ? WHERE id = ?`;

  db.run(query, [amount, category, type, id], function (err) {
    if (err) {
      console.error('❌ Error updating transaction:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction updated' });
  });
});

// DELETE /transactions/:id - Delete a transaction
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  console.log('🗑 Delete request received for ID:', id);

  const query = `DELETE FROM record WHERE id = ?`;

  db.run(query, [id], function (error) {
    if (error) {
      console.error('❌ Error deleting transaction:', error);
      return res.status(500).json({ error: 'Failed to delete transaction' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    console.log('✅ Delete result:', this);
    res.json({ message: 'Transaction deleted successfully' });
  });
});

module.exports = router;
