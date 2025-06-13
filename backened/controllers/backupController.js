const db = require('../config/db');

exports.getBackup = async (req, res) => {
  try {
    console.log('Running query: SELECT * FROM record');
    const [transactions] = await db.promise().query('SELECT * FROM record');
    console.log('Transactions fetched:', transactions.length);

    console.log('Running query: SELECT * FROM budgets');
    const [budgets] = await db.promise().query('SELECT * FROM budgets');
    console.log('Budgets fetched:', budgets.length);

    const backupData = {
      transactions,
      budgets,
      createdAt: new Date().toISOString(),
    };

    res.json(backupData);

  } catch (err) {
    console.error('❌ Backup error:', err);
    res.status(500).json({ error: 'Backup failed' });
  }
};
