const express = require("express");
const router = express.Router();
const db = require('../config/db'); // Database Connection Import

// Get Monthly Report
router.get("/monthly", (req, res) => {
  const { month, year } = req.query;
  const formattedMonth = `${year}-${month.padStart(2, "0")}`;

  const query = `
    SELECT category, transaction_type, SUM(amount) AS total_amount, validity AS date 
    FROM transactions 
    WHERE DATE_FORMAT(validity, '%Y-%m') = ? 
    GROUP BY category, transaction_type, validity
  `;

  db.query(query, [formattedMonth], (err, results) => {
    if (err) {
      console.error("Monthly Report Error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, report: results });
  });
});

// Get Weekly Report
router.get("/weekly", (req, res) => {
  const { start_date, end_date } = req.query;

  const query = `
    SELECT category, transaction_type, SUM(amount) AS total_amount, validity AS date 
    FROM transactions 
    WHERE validity BETWEEN ? AND ? 
    GROUP BY category, transaction_type, validity
  `;

  db.query(query, [start_date, end_date], (err, results) => {
    if (err) {
      console.error("Weekly Report Error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, report: results });
  });
});

// Get Custom Date Range Report
router.get("/custom", (req, res) => {
  const { start_date, end_date } = req.query;

  const query = `
    SELECT category, transaction_type, SUM(amount) AS total_amount, validity AS date 
    FROM transactions 
    WHERE validity BETWEEN ? AND ? 
    GROUP BY category, transaction_type, validity
  `;

  db.query(query, [start_date, end_date], (err, results) => {
    if (err) {
      console.error("Custom Report Error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, report: results });
  });
});

module.exports = router;
