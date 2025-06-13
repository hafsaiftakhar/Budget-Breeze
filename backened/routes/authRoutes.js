const express = require('express');
const db = require('../config/db'); // Database Connection Import
const router = express.Router();

router.post('/signup', (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    // ✅ Step 1: Pehle check karo ke email already exist toh nahi karta
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.length > 0) {
            return res.status(400).json({ message: 'Email already exists' }); // ✅ Agar email mil gaya toh error bhejo
        }

        // ✅ Step 2: Agar email exist nahi karta, tab insert karo
        db.query(
            'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
            [first_name, last_name, email, password],
            (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Signup failed' });
                }
                res.status(201).json({ 
                    message: 'User created successfully.', 
                    email: email
                });
            }
        );
    });
});


router.post('/login', (req, res) => {
    const { email, password } = req.body;

    console.log('🔹 Login Request Received:', req.body); // ✅ Debugging

    // ✅ Step 1: Email se user ko find karo
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) {
            console.error('❌ Database Error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        console.log('🔍 User Found:', result); // ✅ Debugging

        if (result.length === 0) {
            console.log('❌ User not found');
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = result[0];

        // ✅ Step 2: Password compare karo
        if (user.password !== password) {
            console.log('❌ Incorrect Password');
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        console.log('✅ Login Successful:', user.email);
        res.status(200).json({
            message: 'Login Successful',
            first_name: user.first_name,
            last_name: user.last_name,
        });
    });
});

router.post('/change-password', (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  console.log('🔹 Received Request:', req.body); // ✅ Check incoming data

  if (!email || !oldPassword || !newPassword) {
    console.log('❌ Missing fields');
    return res.status(400).json({ message: 'Missing fields' });
  }

  // ✅ First, find the user by email
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.error('❌ Error finding user:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    console.log('🔍 User Query Result:', result);

    if (result.length === 0) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result[0];

    // ✅ Check if the old password matches
    if (user.password !== oldPassword) {
      console.log('❌ Incorrect Current Password');
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // ✅ Update password
    db.query('UPDATE users SET password = ? WHERE email = ?', [newPassword, email], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('❌ Error updating password:', updateErr);
        return res.status(500).json({ message: 'Failed to update password' });
      }

      console.log('✅ Password Updated Successfully:', updateResult);
      res.json({ message: 'Password updated successfully' });
    });
  });
});
router.post('/logout', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required for logout" });
    }

    // ✅ Pehle check karo ke user exist karta hai
    db.query("SELECT id FROM users WHERE email = ?", [email], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const userId = result[0].id; // ✅ User ID mil gayi

        // ✅ Database se user ko delete karo
        db.query("DELETE FROM users WHERE id = ?", [userId], (deleteErr) => {
            if (deleteErr) {
                return res.status(500).json({ message: "Error deleting user", error: deleteErr });
            }

            console.log(`User ${userId} logged out and deleted.`);
            res.json({ message: "Logout successful and user deleted", userId });
        });
    });
});


module.exports = router;