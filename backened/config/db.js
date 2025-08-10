// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database ka path
const dbPath = path.resolve(__dirname, 'budget.db');

// Database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

module.exports = db;
