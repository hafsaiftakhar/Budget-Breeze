const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const transactionsRoutes = require("./routes/transactions");
const spendinginsightsRoutes = require("./routes/spendinginsightsRoutes");
const spendinginsightsweeklyRoutes = require("./routes/spendinginsightsweeklyRoutes");
const spendingmonthlyRoutes = require("./routes/spendingmonthlyRoutes");
const reportRoutes = require("./routes/reportRoutes");
const goalRoutes = require("./routes/goalRoutes");
const budgetRoutes = require('./routes/budgetRoutes');
const backupRoutes = require("./routes/backupRoutes");

const app = express();
const port = 3033;

app.use(cors());
app.use(bodyParser.json());

console.log("✅ Express server initializing...");

app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

console.log("📦 Mounting route: /api/auth");
app.use("/api/auth", authRoutes);

console.log("📦 Mounting route: /transactions");
app.use("/transactions", transactionsRoutes);

console.log("📦 Mounting route: /api (for spendingInsights)");
app.use("/api", spendinginsightsRoutes);

console.log("📦 Mounting route: /api/spending-insights-weekly");
app.use("/api/spending-insights-weekly", spendinginsightsweeklyRoutes);

console.log("📦 Mounting route: /api/spending-insights-monthly");
app.use("/api/spending-insights-monthly", spendingmonthlyRoutes);

console.log("📦 Mounting route: /api/reports");
app.use("/api/reports", reportRoutes);

console.log("📦 Mounting route: /api (for goalRoutes)");
app.use("/api", goalRoutes);

// **Important: Mount budgetRoutes at /api/budgets**
console.log("📦 Mounting route: /api/budgets");
app.use("/budget", budgetRoutes);

console.log("📦 Mounting route: /api/backup");
app.use("/api/backup", backupRoutes);

// 404 catch-all
app.use((req, res, next) => {
  console.warn(`🚫 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://192.168.100.8:${port}`);
});
