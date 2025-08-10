const express = require("express");
const router = express.Router();
const db = require('../config/db'); // SQLite connection

// Monthly Report
router.get("/monthly", (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) {
    return res.status(400).json({ success: false, message: "Month and year are required" });
  }
  
  // Format: YYYY-MM (e.g. 2025-08)
  const formattedMonth = `${year}-${month.toString().padStart(2, "0")}`;

  const query = `
    SELECT category, type, SUM(amount) AS amount, date
    FROM record
    WHERE strftime('%Y-%m', date) = ?
    GROUP BY category, type, date
  `;

  db.all(query, [formattedMonth], (err, results) => {
    if (err) {
      console.error("Monthly Report Error:", err.message);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, report: results });
  });
});

// Weekly Report
router.get("/weekly", (req, res) => {
  const { start_date, end_date } = req.query;
  if (!start_date || !end_date) {
    return res.status(400).json({ success: false, message: "Start date and end date are required" });
  }

  const query = `
    SELECT category, type, SUM(amount) AS amount, date
    FROM record
    WHERE date BETWEEN ? AND ?
    GROUP BY category, type, date
  `;

  db.all(query, [start_date, end_date], (err, results) => {
    if (err) {
      console.error("Weekly Report Error:", err.message);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, report: results });
  });
});

// Custom Date Range Report
router.get("/custom", (req, res) => {
  const { start_date, end_date } = req.query;
  if (!start_date || !end_date) {
    return res.status(400).json({ success: false, message: "Start date and end date are required" });
  }

  const query = `
    SELECT category, type, SUM(amount) AS amount, date
    FROM record
    WHERE date BETWEEN ? AND ?
    GROUP BY category, type, date
  `;

  db.all(query, [start_date, end_date], (err, results) => {
    if (err) {
      console.error("Custom Report Error:", err.message);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, report: results });
  });
});

module.exports = router;
