const express = require("express");
const router = express.Router();
const db = require("../config/db"); // ✅ Ensure this file exists

router.get("/compare-weekly-spending", (req, res) => {
  console.log("✅ Weekly Spending Insights API Called!");

  const currentWeekQuery = `
    SELECT 
      SUM(amount) AS total_expense,
      MIN(date) AS week_start,
      DATE_ADD(MIN(date), INTERVAL 6 DAY) AS week_end,
      'Current Week' AS week_label
    FROM transactions
    WHERE transaction_type = 'expense'
      AND validity = 'weekly'
      AND amount > 0
      AND date >= (SELECT MAX(date) FROM transactions WHERE validity = 'weekly') - INTERVAL 6 DAY;
  `;

  db.query(currentWeekQuery, (err, currentWeekResult) => {
    if (err) {
      console.error("❌ Error fetching current week spending:", err);
      return res.status(500).json({ error: "Internal Server Error", details: err.message });
    }

    console.log("✅ Current Week Query Result:", currentWeekResult);

    const lastWeekQuery = `
      SELECT 
        SUM(amount) AS total_expense,
        MIN(date) AS week_start,
        DATE_ADD(MIN(date), INTERVAL 6 DAY) AS week_end,
        'Previous Week' AS week_label
      FROM transactions
      WHERE transaction_type = 'expense'
        AND validity = 'weekly'
        AND amount > 0
        AND date BETWEEN 
            (SELECT MAX(date) FROM transactions WHERE validity = 'weekly') - INTERVAL 13 DAY
            AND
            (SELECT MAX(date) FROM transactions WHERE validity = 'weekly') - INTERVAL 7 DAY;
    `;

    db.query(lastWeekQuery, (err, lastWeekResult) => {
      if (err) {
        console.error("❌ Error fetching last week spending:", err);
        return res.status(500).json({ error: "Internal Server Error", details: err.message });
      }

      console.log("✅ Last Week Query Result:", lastWeekResult);

      res.json({ 
        currentWeekExpense: currentWeekResult[0].total_expense || 0, 
        lastWeekExpense: lastWeekResult[0].total_expense || 0 
      });
    });
  });
});

module.exports = router;
