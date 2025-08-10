const db = require('../config/db'); // sqlite3 instance

exports.getBackup = (req, res) => {
  db.serialize(() => {
    db.all("SELECT * FROM record", (err, transactions) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch transactions" });
      }

      db.all("SELECT * FROM budgets", (err2, budgets) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ error: "Failed to fetch budgets" });
        }

        res.json({
          transactions,
          budgets,
          createdAt: new Date().toISOString(),
        });
      });
    });
  });
};

exports.restoreBackup = (req, res) => {
  const { transactions = [], budgets = [] } = req.body;

  db.serialize(() => {
    db.run("DELETE FROM record");
    db.run("DELETE FROM budgets");

    const insertRecord = db.prepare("INSERT INTO record (id, type, amount, category, date) VALUES (?, ?, ?, ?, ?)");
    const insertBudget = db.prepare("INSERT INTO budgets (id, category, amount, created_at) VALUES (?, ?, ?, ?)");

    for (const t of transactions) {
      insertRecord.run(t.id, t.type, t.amount, t.category, t.date, err => {
        if (err) console.error("Insert record error:", err);
      });
    }

    for (const b of budgets) {
      insertBudget.run(b.id, b.category, b.amount, b.created_at || new Date().toISOString(), err => {
        if (err) console.error("Insert budget error:", err);
      });
    }

    insertRecord.finalize();
    insertBudget.finalize();

    res.json({ message: "Restore successful", transactionsRestored: transactions.length, budgetsRestored: budgets.length, restoredAt: new Date().toISOString() });
  });
};
