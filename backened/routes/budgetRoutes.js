const express = require('express');
const router = express.Router();
const db = require('../config/db');

const predefinedCategories = [
  "Beauty", "Clothing", "Education", "Electronics", "Entertainment", "Food",
  "Health", "Home", "Insurance", "Shopping", "Social", "Sport", "Tax", "Mobile Phone", "Transportation",
];

// GET budget based on filter
router.get('/api/data', (req, res) => {
  const filter = req.query.filter || 'daily';

  let query = '';
  if (filter === 'weekly') {
    query = `
      SELECT category, SUM(amount) AS amount 
      FROM budgets 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY category
    `;
  } else if (filter === 'monthly') {
    query = `
      SELECT category, SUM(amount) AS amount 
      FROM budgets 
      WHERE MONTH(created_at) = MONTH(CURDATE()) 
        AND YEAR(created_at) = YEAR(CURDATE())
      GROUP BY category
    `;
  } else {
    query = `
      SELECT category, SUM(amount) AS amount 
      FROM budgets 
      WHERE DATE(created_at) = CURDATE() 
      GROUP BY category
    `;
  }

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Budget fetch error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ budgets: results });
  });
});

// GET all categories (predefined + user-defined)
router.get('/api/categories', (req, res) => {
  // Added quotes for query string
  const query = `SELECT DISTINCT category FROM budgets`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Category fetch error:', err);
      return res.status(500).json({ error: err });
    }

    const userCategories = results.map(r => r.category);
    const allCategories = [...new Set([...predefinedCategories, ...userCategories])];

    console.log('✅ Fetched categories:', allCategories);
    res.json({ categories: allCategories });
  });
});

// POST save budget
router.post('/api/save-budget', (req, res) => {
  const { category, amount } = req.body;

  if (!category || !amount) {
    return res.status(400).json({ error: 'Category and amount are required' });
  }

  // Added quotes around query string
  const query = `INSERT INTO budgets (category, amount) VALUES (?, ?)`;

  db.query(query, [category, amount], (err) => {
    if (err) {
      console.error('❌ Save error:', err);
      return res.status(500).json({ error: err });
    }

    console.log('✅ Budget saved for category:', category);
    res.json({ message: 'Budget saved successfully' });
  });
});

// DELETE today's category budget
router.delete('/api/delete-category', (req, res) => {
  const { category } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  console.log('🗑 Deleting today\'s budget for category:', category);

  const query = `
    DELETE FROM budgets 
    WHERE category = ? AND DATE(created_at) = CURDATE()
  `;
  db.query(query, [category], (err) => {
    if (err) {
      console.error('❌ Delete error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ message: 'Category deleted successfully for today' });
  });
});

// GET expense per category (based on filter)
router.get('/api/expense-per-category', (req, res) => {
  const filter = req.query.filter || 'daily';

  let query = '';
  if (filter === 'weekly') {
    query = `
      SELECT category, SUM(amount) AS spent
      FROM record
      WHERE type = 'expense'
        AND date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY category
    `;
  } else if (filter === 'monthly') {
    query = `
      SELECT category, SUM(amount) AS spent
      FROM record
      WHERE type = 'expense'
        AND MONTH(date) = MONTH(CURDATE())
        AND YEAR(date) = YEAR(CURDATE())
      GROUP BY category
    `;
  } else {
    // daily
    query = `
      SELECT category, SUM(amount) AS spent
      FROM record
      WHERE type = 'expense' AND DATE(date) = CURDATE()
      GROUP BY category
    `;
  }

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching spent amounts:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ spentPerCategory: results });
  });
});

module.exports = router;
