const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Login User
router.get('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Set the user ID in session (no JWT required)
    req.session.userId = user.id;
    req.session.role = user.role;

    res.json({ msg: 'Login Successful' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Register User
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role,
    });

    await user.save();

    // Set the user ID in session (no JWT required)
    req.session.userId = user.id;
    req.session.role = user.role;

    res.json({ msg: 'Registration Successful' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Logout User (Clear Session)
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ msg: 'Failed to log out' });
    }
    res.json({ msg: 'Logged out successfully' });
  });
});

module.exports = router;
