const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Ensure this points to your database connection file

router.get("/compare-daily-spending", (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const query = `
   SELECT
    SUM(CASE WHEN DATE(date) = CURDATE() THEN amount ELSE 0 END) AS today_expense,
    SUM(CASE WHEN DATE(date) = CURDATE() - INTERVAL 1 DAY THEN amount ELSE 0 END) AS yesterday_expense
FROM transactions
WHERE transaction_type = 'Expense' 
AND validity = 'daily';
  `;

  db.query(query, (err, results) => {
  if (err) {
    console.error("❌ Error fetching transactions:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
  
  console.log("✅ Raw Query Results:", results); // Debugging Query Result
  console.log("✅ SQL Query Executed:", query); // Debugging Query String

  if (!results || results.length === 0) {
    console.log("❌ No results found in database");
    return res.json({ todayExpense: 0, yesterdayExpense: 0, message: "No data found" });
  }

  const todayExpense = results[0].today_expense || 0;
  const yesterdayExpense = results[0].yesterday_expense || 0;

  console.log("✅ Processed Today Expense:", todayExpense);
  console.log("✅ Processed Yesterday Expense:", yesterdayExpense);

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
