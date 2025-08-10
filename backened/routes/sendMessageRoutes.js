const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const db = require('../config/db'); // SQLite connection

router.post('/', async (req, res) => {
  const { message } = req.body;

  // Save message in SQLite 'messages' table first
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`INSERT INTO messages (message) VALUES (?)`, [message], function(err) {
    if (err) {
      console.error('Error saving message:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to save message' });
    }

    // Then send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'hafsaiftakhar123@gmail.com',
        pass: 'cunb nsdq qwot aryq', // please secure this
      },
    });

    const mailOptions = {
      from: 'hafsaiftakhar123@gmail.com',
      to: 'hafsaiftakhar123@gmail.com',
      subject: 'New support message from Budget Breeze App',
      text: message,
    };

    transporter.sendMail(mailOptions)
      .then(() => {
        res.status(200).json({ success: true, message: 'Message saved and sent successfully' });
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send message but saved in DB' });
      });
  });
});

module.exports = router;
