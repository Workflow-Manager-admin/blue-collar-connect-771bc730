const express = require('express');
const User = require('../models/User');
const { authenticateJWT } = require('../middleware/authenticate');
const router = express.Router();

/**
 * @route   GET /api/users/
 * @desc    List all users (public information)
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('company', 'name');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Fetch user profile (public info)
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('company', 'name');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile (protected)
 */
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    const updateFields = { ...req.body };
    delete updateFields.password;
    const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
