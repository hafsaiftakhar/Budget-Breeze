const express = require("express");
const router = express.Router();
const db = require("../config/db"); // SQLite connection

router.get("/compare-daily-spending", (req, res) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const query = `
    SELECT
      SUM(CASE WHEN date = ? THEN amount ELSE 0 END) AS today_expense,
      SUM(CASE WHEN date = ? THEN amount ELSE 0 END) AS yesterday_expense
    FROM transactions
    WHERE transaction_type = 'Expense' AND validity = 'daily';
  `;

  db.get(query, [todayStr, yesterdayStr], (err, row) => {
    if (err) {
      console.error("❌ Error fetching transactions:", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }

    // row should always exist with SUM results, but double check
    const todayExpense = row?.today_expense || 0;
    const yesterdayExpense = row?.yesterday_expense || 0;

    let message = "";
    if (todayExpense < yesterdayExpense) {
      message = "Great job! You spent less today than yesterday.";
    } else if (todayExpense > yesterdayExpense) {
      message = "Be careful! You spent more today than yesterday.";
    } else {
      message = "You spent the same amount today as yesterday.";
    }

    res.json({ todayExpense, yesterdayExpense, message });
  });
});

module.exports = router;
