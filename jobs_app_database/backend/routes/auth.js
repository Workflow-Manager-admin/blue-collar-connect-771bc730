const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user (worker or employer)
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, phone, role, bio, location, skills, experience, company } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required.' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name, phone, role, bio, location, skills, experience, company });
    await user.save();
    return res.status(201).json({ message: 'User created.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user, returns JWT
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('company');
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });
    // PUBLIC_INTERFACE
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "supersecretkey123",
      { expiresIn: "10d" }
    );
    res.json({ token, user: { id: user._id, email: user.email, role: user.role, company: user.company } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
