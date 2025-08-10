const express = require('express');
const nodemailer = require('nodemailer');
const db = require('../config/db'); // SQLite connection object
const router = express.Router();

// Global in-memory OTP store
global.otpStore = global.otpStore || {};
const otpStore = global.otpStore;
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);


// Configure nodemailer transporter (Use your Gmail and App Password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hafsaiftakhar123@gmail.com',       // Your email here
    pass: 'cunb nsdq qwot aryq',               // Your Gmail App Password here
  },
});

/* ===================================
   SIGNUP ROUTE
=================================== */
router.post('/signup', (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (user) return res.status(400).json({ message: 'Email already exists' });

    db.run(
      'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
      [first_name, last_name, normalizedEmail, password],
      function(err) {
        if (err) return res.status(500).json({ message: 'Signup failed' });

        res.status(201).json({ message: 'User created successfully.', email: normalizedEmail });
      }
    );
  });
});

/* ===================================
   LOGIN ROUTE
=================================== */
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      message: 'Login Successful',
      first_name: user.first_name,
      last_name: user.last_name,
    });
  });
});

/* ===================================
   FORGOT PASSWORD - SEND OTP ROUTE
=================================== */
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const normalizedEmail = email.trim().toLowerCase();

  db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[normalizedEmail] = otp;

    console.log(`Generated OTP for ${normalizedEmail}: ${otp}`);
    console.log('Current OTP Store:', otpStore);

    const mailOptions = {
      from: 'hafsaiftakhar123@gmail.com',        
      to: normalizedEmail,
      subject: 'Your OTP Code for Password Reset',
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP email:', error);
        return res.status(500).json({ message: 'Failed to send OTP email' });
      } else {
        console.log('OTP email sent:', info.response);
        res.json({ message: 'OTP sent to your email' });
      }
    });
  });
});

/* ===================================
   RESEND OTP ROUTE
=================================== */
router.post('/resend-otp', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const normalizedEmail = email.trim().toLowerCase();

  db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[normalizedEmail] = otp;

    console.log(`Resent OTP for ${normalizedEmail}: ${otp}`);
    console.log('Current OTP Store:', otpStore);

    const mailOptions = {
      from: 'hafsaiftakhar123@gmail.com',
      to: normalizedEmail,
      subject: 'Your OTP Code (Resent)',
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error resending OTP email:', error);
        return res.status(500).json({ message: 'Failed to resend OTP email' });
      } else {
        console.log('OTP resend email sent:', info.response);
        res.json({ message: 'OTP resent successfully' });
      }
    });
  });
});

/* ===================================
   RESET PASSWORD WITH OTP ROUTE
=================================== */
router.post('/reset-password', (req, res) => {
  const { email, newPassword, otp } = req.body;
  if (!email || !newPassword || !otp) {
    return res.status(400).json({ message: 'Email, new password, and OTP are required' });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const savedOtp = otpStore[normalizedEmail];
  if (!savedOtp) {
    return res.status(400).json({ message: 'No OTP found for this email. Please request OTP first.' });
  }
  if (String(savedOtp) !== String(otp)) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  db.run('UPDATE users SET password = ? WHERE email = ?', [newPassword, normalizedEmail], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error updating password' });
    }

    // Delete OTP after successful reset
    delete otpStore[normalizedEmail];

    res.json({ message: 'Password reset successfully' });
  });
});

/* ===================================
   LOGOUT ROUTE
=================================== */
router.post('/logout', (req, res) => {
  // Clear session or token logic here if any
  res.json({ message: 'Logout successful' });
});

/* ===================================
   VERIFY OTP ROUTE
=================================== */
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const savedOtp = otpStore[normalizedEmail];
  if (!savedOtp) {
    return res.status(400).json({ message: 'No OTP found for this email' });
  }
  if (String(savedOtp) === String(otp)) {
    return res.json({ message: 'OTP verified successfully' });
  } else {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
});

module.exports = router;
