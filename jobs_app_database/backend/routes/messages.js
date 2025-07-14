const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { authenticateJWT } = require('../middleware/authenticate');
const router = express.Router();

/**
 * @route   GET /api/messages/conversation/:userId
 * @desc    Get all messages between authenticated user and target user
 */
router.get('/conversation/:userId', authenticateJWT, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user.id }
      ]
    }).sort({ sentAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/messages/send
 * @desc    Send a message to another user
 */
router.post('/send', authenticateJWT, async (req, res) => {
  try {
    const { receiver, content } = req.body;
    const receiverExists = await User.findById(receiver);
    if (!receiverExists) return res.status(404).json({ error: 'Receiver not found.' });
    const msg = new Message({
      sender: req.user.id,
      receiver,
      content
    });
    await msg.save();
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
