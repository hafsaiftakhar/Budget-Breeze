const express = require('express');
const router = express.Router();
const db = require('../config/db'); // SQLite connection

// Backup data get karne ke liye
const getBackup = (req, res) => {
  const budgetsQuery = `SELECT * FROM budgets;`;
  const transactionsQuery = `SELECT * FROM record ORDER BY date DESC;`;

  db.serialize(() => {
    db.all(budgetsQuery, [], (err, budgets) => {
      if (err) {
        console.error('Backup fetch error (budgets):', err.message);
        return res.status(500).json({ error: 'Database error fetching budgets' });
      }
      db.all(transactionsQuery, [], (err2, transactions) => {
        if (err2) {
          console.error('Backup fetch error (transactions):', err2.message);
          return res.status(500).json({ error: 'Database error fetching transactions' });
        }
        res.json({ budgets, transactions });
      });
    });
  });
};

// Restore backup data ke liye
const restoreBackup = (req, res) => {
  const { budgets, transactions } = req.body;

  if (
    !budgets || !Array.isArray(budgets) ||
    !transactions || !Array.isArray(transactions)
  ) {
    return res.status(400).json({ error: 'Invalid backup data' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Purani data delete kar do (optional)
    db.run('DELETE FROM budgets');
    db.run('DELETE FROM record');

    // Budgets insert karna
    const insertBudget = db.prepare(`INSERT INTO budgets (category, amount, created_at) VALUES (?, ?, ?)`);
    for (const b of budgets) {
      insertBudget.run([b.category, b.amount, b.created_at], (err) => {
        if (err) console.error('Insert budget error:', err.message);
      });
    }
    insertBudget.finalize();

    // Transactions insert karna
    const insertTransaction = db.prepare(`INSERT INTO record (type, amount, category, date) VALUES (?, ?, ?, ?)`);
    for (const t of transactions) {
      insertTransaction.run([t.type, t.amount, t.category, t.date], (err) => {
        if (err) console.error('Insert transaction error:', err.message);
      });
    }
    insertTransaction.finalize();

    db.run('COMMIT', (err) => {
      if (err) {
        console.error('Restore commit error:', err.message);
        return res.status(500).json({ error: 'Restore failed' });
      }
      res.json({
        message: 'Backup restored successfully',
        budgetsRestored: budgets.length,
        transactionsRestored: transactions.length,
        restoredAt: new Date().toISOString(),
      });
    });
  });
};

// Routes
router.get('/', getBackup);
router.post('/restore', restoreBackup);

module.exports = router;
