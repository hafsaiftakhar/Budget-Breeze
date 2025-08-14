// routes/authRoutes.js
const express = require('express');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken'); // JWT import
const router = express.Router();

// Secret key for JWT (use .env in production)
const JWT_SECRET = 'MyVeryStrongSecret123$!';

// -----------------------------
// SQLite connection
// -----------------------------
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('DB Connection error:', err);
  else console.log('Connected to SQLite database.');
});

// Ensure users table exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// Global OTP store
global.otpStore = global.otpStore || {};
const otpStore = global.otpStore;

// -----------------------------
// Nodemailer config
// -----------------------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hafsaiftakhar123@gmail.com',
    pass: 'cunb nsdq qwot aryq',
  },
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) console.log('Nodemailer Error:', error);
  else console.log('Server ready to send emails');
});

// ===================================
// SIGNUP ROUTE
// ===================================
router.post('/signup', (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (user) return res.status(400).json({ message: 'Email already exists' });

    db.run(
      'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
      [first_name, last_name, normalizedEmail, password],
      function (err) {
        if (err) return res.status(500).json({ message: 'Signup failed' });

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[normalizedEmail] = otp;

        // Send OTP email
        transporter.sendMail({
          from: 'hafsaiftakhar123@gmail.com',
          to: normalizedEmail,
          subject: 'Your OTP Code',
          text: `Welcome! Your OTP code is ${otp}. It is valid for 10 minutes.`,
        }, (error, info) => {
          if (error) return res.status(500).json({ message: 'Failed to send OTP email' });

          res.status(201).json({
            message: 'User created successfully. OTP sent to your email.',
            userId: this.lastID,
            email: normalizedEmail
          });
        });
      }
    );
  });
});

// ===================================
// LOGIN ROUTE with JWT
// ===================================
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login Successful',
      userId: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: normalizedEmail,
      token, // send token to client
    });
  });
});

// ===================================
// VERIFY TOKEN MIDDLEWARE
// ===================================
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded; // decoded contains id and email
    next();
  });
}

// Example protected route
router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user.email}, you are authorized!` });
});

module.exports = router;
