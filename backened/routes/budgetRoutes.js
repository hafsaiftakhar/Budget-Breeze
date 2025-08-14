const express = require('express');
const router = express.Router();
const db = require('../config/db');

const predefinedCategories = [
  "Beauty", "Clothing", "Education", "Electronics", "Entertainment", "Food",
  "Health", "Home", "Insurance", "Shopping", "Social", "Sport", "Tax", "Mobile Phone", "Transportation",
];

// ---------------------- Ensure Tables Exist ---------------------- //
db.run(`CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at TEXT NOT NULL,
  user_id TEXT NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS record (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  user_id TEXT NOT NULL
)`);

// ---------------------- Get Budgets (daily/weekly/monthly) ---------------------- //
router.get('/data', (req, res) => {
  const filter = req.query.filter || 'daily';
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'User ID required' });

  let query = '';
  if (filter === 'weekly') {
    query = `SELECT category, SUM(amount) AS amount FROM budgets 
             WHERE user_id = ? AND date(created_at) >= date('now', '-6 days') 
             GROUP BY category`;
  } else if (filter === 'monthly') {
    query = `SELECT category, SUM(amount) AS amount FROM budgets 
             WHERE user_id = ? AND strftime('%m', created_at) = strftime('%m', 'now') 
             AND strftime('%Y', created_at) = strftime('%Y', 'now') 
             GROUP BY category`;
  } else {
    query = `SELECT category, SUM(amount) AS amount FROM budgets 
             WHERE user_id = ? AND date(created_at) = date('now') 
             GROUP BY category`;
  }

  db.all(query, [userId], (err, results) => {
    if (err) {
      console.error('Budget fetch error:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ budgets: results });
  });
});

// ---------------------- Get All Categories ---------------------- //
router.get('/categories', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'User ID required' });

  const query = `SELECT DISTINCT category FROM budgets WHERE user_id = ?`;
  db.all(query, [userId], (err, results) => {
    if (err) {
      console.error('Category fetch error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    const userCategories = results.map(r => r.category);
    const allCategories = [...new Set([...predefinedCategories, ...userCategories])];
    res.json({ categories: allCategories });
  });
});

// ---------------------- Save Budget ---------------------- //
router.post('/save-budget', (req, res) => {
  let { category, amount, user_id } = req.body;
  if (!category || !amount || !user_id) {
    return res.status(400).json({ error: 'Category, amount and user_id are required' });
  }

  if (typeof category === 'object' && category !== null) {
    category = category.name;
  }

  const query = `INSERT INTO budgets (category, amount, created_at, user_id) 
                 VALUES (?, ?, datetime('now'), ?)`;
  db.run(query, [category, amount, user_id], function (err) {
    if (err) {
      console.error('Save error:', err.message);
      return res.status(500).json({ error: 'Error saving budget' });
    }
    res.json({ message: 'Budget saved successfully' });
  });
});

// ---------------------- Delete Today's Budget Category ---------------------- //
router.delete('/delete-category', (req, res) => {
  const { category, user_id } = req.body;
  if (!category || !user_id) return res.status(400).json({ error: 'Category and user_id required' });

  const query = `DELETE FROM budgets WHERE category = ? AND user_id = ? AND date(created_at) = date('now')`;
  db.run(query, [category, user_id], function (err) {
    if (err) {
      console.error('Delete error:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ message: 'Category deleted successfully for today' });
  });
});

// ---------------------- Expense per Category (daily/weekly/monthly) ---------------------- //
router.get('/expense-per-category', (req, res) => {
  const filter = req.query.filter || 'daily';
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'User ID required' });

  let query = '';
  if (filter === 'weekly') {
    query = `SELECT category, SUM(amount) AS spent FROM record 
             WHERE user_id = ? AND type = 'expense' AND date(date) >= date('now', '-6 days') 
             GROUP BY category`;
  } else if (filter === 'monthly') {
    query = `SELECT category, SUM(amount) AS spent FROM record 
             WHERE user_id = ? AND type = 'expense' AND strftime('%m', date) = strftime('%m', 'now') 
             AND strftime('%Y', date) = strftime('%Y', 'now') 
             GROUP BY category`;
  } else {
    query = `SELECT category, SUM(amount) AS spent FROM record 
             WHERE user_id = ? AND type = 'expense' AND date(date) = date('now') 
             GROUP BY category`;
  }

  db.all(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching spent amounts:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ spentPerCategory: results });
  });
});

module.exports = router;
