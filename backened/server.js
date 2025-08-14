const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session'); // ✅ Add session
require('dotenv').config(); // ✅ For environment variables

// Connect SQLite
require('./config/db');

const authRoutes = require('./routes/authRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const backupRoutes = require("./routes/backupRoutes");
const goalRoutes = require("./routes/goalRoutes");
const sendMessageRoutes = require('./routes/sendMessageRoutes');
const spendinginsightsRoutes = require("./routes/spendinginsightsRoutes");
const transactionsRoutes = require("./routes/transactions");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Session middleware (must be before routes)
app.use(session({
  secret: process.env.SESSION_SECRET || 'my_super_secret_key_123!@#', // use .env in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // development: false, production: true + HTTPS
}));

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/transactions", transactionsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api", goalRoutes);
app.use('/api/send-message', sendMessageRoutes);
app.use("/api", spendinginsightsRoutes);

const PORT = 3033;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
