const express = require("express");
const router = express.Router();
const db = require("../config/db");  // Yahan apne db.js ka path sahi likhein

// Get all goals
router.get("/goals", (req, res) => {
  db.query("SELECT * FROM goals", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Add new goal
router.post("/goals", (req, res) => {
  const { name, targetAmount, currentProgress, deadline } = req.body;
  const sql = "INSERT INTO goals (name, targetAmount, currentProgress, deadline) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, targetAmount, currentProgress, deadline], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ id: result.insertId, ...req.body });
  });
});

// Update goal progress and achieved status
router.put("/goals/:id", (req, res) => {
  const { currentProgress, achieved } = req.body;
  const sql = "UPDATE goals SET currentProgress = ?, achieved = ? WHERE id = ?";
  db.query(sql, [currentProgress, achieved, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    db.query("SELECT * FROM goals WHERE id = ?", [req.params.id], (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results[0]);
    });
  });
});

module.exports = router;
