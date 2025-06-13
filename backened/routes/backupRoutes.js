const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupcontroller');

router.get('/', backupController.getBackup); // ✅ change here

module.exports = router;
