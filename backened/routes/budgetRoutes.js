const express = require('express');
const router = express.Router();
const db = require('../config/db');

const predefinedCategories = [
  "Beauty", "Clothing", "Education", "Electronics", "Entertainment", "Food",
  "Health", "Home", "Insurance", "Shopping", "Social", "Sport", "Tax", "Mobile Phone", "Transportation",
];

// Ensure tables exist
db.run(`CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at TEXT NOT NULL
)`);
db.run(`CREATE TABLE IF NOT EXISTS record (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL
)`);

// Get budgets with filter (daily, weekly, monthly)
router.get('/data', (req, res) => {
  const filter = req.query.filter || 'daily';
  let query = '';

  if (filter === 'weekly') {
    query = `SELECT category, SUM(amount) AS amount FROM budgets WHERE date(created_at) >= date('now', '-6 days') GROUP BY category`;
  } else if (filter === 'monthly') {
    query = `SELECT category, SUM(amount) AS amount FROM budgets WHERE strftime('%m', created_at) = strftime('%m', 'now') AND strftime('%Y', created_at) = strftime('%Y', 'now') GROUP BY category`;
  } else {
    query = `SELECT category, SUM(amount) AS amount FROM budgets WHERE date(created_at) = date('now') GROUP BY category`;
  }

  db.all(query, [], (err, results) => {
    if (err) {
      console.error('Budget fetch error:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ budgets: results });
  });
});

// Get all categories (predefined + from budgets)
router.get('/categories', (req, res) => {
  const query = `SELECT DISTINCT category FROM budgets`;

  db.all(query, [], (err, results) => {
    if (err) {
      console.error('Category fetch error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    const userCategories = results.map(r => r.category);
    const allCategories = [...new Set([...predefinedCategories, ...userCategories])];
    res.json({ categories: allCategories });
  });
});

// Save budget
router.post('/save-budget', (req, res) => {
  let { category, amount } = req.body;
  if (!category || !amount) {
    return res.status(400).json({ error: 'Category and amount are required' });
  }

  // Handle if category is object, take category.name
  if (typeof category === 'object' && category !== null) {
    category = category.name;
  }

  const query = `INSERT INTO budgets (category, amount, created_at) VALUES (?, ?, datetime('now'))`;
  db.run(query, [category, amount], function(err) {
    if (err) {
      console.error('Save error:', err.message);
      return res.status(500).json({ error: 'Error saving budget' });
    }
    res.json({ message: 'Budget saved successfully' });
  });
});

// Delete today's budget category
router.delete('/delete-category', (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ error: 'Category name is required' });

  const query = `DELETE FROM budgets WHERE category = ? AND date(created_at) = date('now')`;
  db.run(query, [category], function(err) {
    if (err) {
      console.error('Delete error:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ message: 'Category deleted successfully for today' });
  });
});

// Get expense per category (filtered)
router.get('/expense-per-category', (req, res) => {
  const filter = req.query.filter || 'daily';
  let query = '';

  if (filter === 'weekly') {
    query = `SELECT category, SUM(amount) AS spent FROM record WHERE type = 'expense' AND date(date) >= date('now', '-6 days') GROUP BY category`;
  } else if (filter === 'monthly') {
    query = `SELECT category, SUM(amount) AS spent FROM record WHERE type = 'expense' AND strftime('%m', date) = strftime('%m', 'now') AND strftime('%Y', date) = strftime('%Y', 'now') GROUP BY category`;
  } else {
    query = `SELECT category, SUM(amount) AS spent FROM record WHERE type = 'expense' AND date(date) = date('now') GROUP BY category`;
  }

  db.all(query, [], (err, results) => {
    if (err) {
      console.error('Error fetching spent amounts:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ spentPerCategory: results });
  });
});

module.exports = router;
