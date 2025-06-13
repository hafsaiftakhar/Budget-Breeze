const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get Monthly Spending Insights
router.get("/compare-monthly-spending", (req, res) => {
  const query = `
    SELECT 
    SUM(CASE WHEN MONTH(date) = MONTH(CURDATE()) THEN amount ELSE 0 END) AS currentMonthExpense,
    SUM(CASE WHEN MONTH(date) = MONTH(CURDATE()) - 1 THEN amount ELSE 0 END) AS lastMonthExpense
    FROM transactions
     WHERE transaction_type = 'expense';
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error fetching monthly spending:", err.message);
      return res.status(500).json({ success: false, message: "Failed to fetch monthly spending." });
    }

    res.json(result[0]);
  });
});

module.exports = router;
