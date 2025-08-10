const express = require("express");
const router = express.Router();
const db = require("../config/db"); // SQLite connection

// Table creation (agar exist nahi karti to create kar dega)
db.run(`CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  targetAmount REAL NOT NULL,
  currentProgress REAL NOT NULL,
  deadline TEXT NOT NULL,
  achieved INTEGER NOT NULL DEFAULT 0
)`, (err) => {
  if (err) {
    console.error("Error creating goals table:", err.message);
  } else {
    console.log("Goals table ready.");
  }
});

// Get all goals
router.get("/goals", (req, res) => {
  const sql = "SELECT * FROM goals";
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching goals:', err.message);
      return res.status(500).send(err.message);
    }
    res.json(rows);
  });
});

// Add new goal
router.post("/goals", (req, res) => {
  const { name, targetAmount, currentProgress, deadline } = req.body;
  const achieved = parseFloat(currentProgress) >= parseFloat(targetAmount) ? 1 : 0;
  const sql = `
    INSERT INTO goals (name, targetAmount, currentProgress, deadline, achieved)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(sql, [name, targetAmount, currentProgress, deadline, achieved], function(err) {
    if (err) {
      console.error('Error adding goal:', err.message);
      return res.status(500).send(err.message);
    }
    res.json({ id: this.lastID, name, targetAmount, currentProgress, deadline, achieved });
  });
});

// Update entire goal
router.put("/goals/:id", (req, res) => {
  const { name, targetAmount, currentProgress, deadline, achieved } = req.body;
  const sql = `
    UPDATE goals
    SET name = ?, targetAmount = ?, currentProgress = ?, deadline = ?, achieved = ?
    WHERE id = ?
  `;
  db.run(sql, [name, targetAmount, currentProgress, deadline, achieved, req.params.id], function(err) {
    if (err) {
      console.error('Error updating goal:', err.message);
      return res.status(500).send(err.message);
    }
    db.get("SELECT * FROM goals WHERE id = ?", [req.params.id], (err, row) => {
      if (err) {
        console.error('Error fetching updated goal:', err.message);
        return res.status(500).send(err.message);
      }
      res.json(row);
    });
  });
});

// PATCH route to update progress only
router.patch("/goals/:id/progress", (req, res) => {
  const { currentProgress, achieved } = req.body;
  const sql = "UPDATE goals SET currentProgress = ?, achieved = ? WHERE id = ?";
  db.run(sql, [currentProgress, achieved, req.params.id], function(err) {
    if (err) {
      console.error('Error updating goal progress:', err.message);
      return res.status(500).send(err.message);
    }
    db.get("SELECT * FROM goals WHERE id = ?", [req.params.id], (err, row) => {
      if (err) {
        console.error('Error fetching goal after progress update:', err.message);
        return res.status(500).send(err.message);
      }
      res.json(row);
    });
  });
});

// Delete a goal
router.delete("/goals/:id", (req, res) => {
  const sql = "DELETE FROM goals WHERE id = ?";
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      console.error('Error deleting goal:', err.message);
      return res.status(500).send(err.message);
    }
    res.json({ message: "Goal deleted." });
  });
});

module.exports = router;