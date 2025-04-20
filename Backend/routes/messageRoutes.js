// filepath: d:\community-help-exchange_FYP\Backend\routes\messageRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../models/messageModel');
const { protect } = require('../middleware/authMiddleware');

router.get('/:senderId/:receiverId', protect, async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages); // Ensure _id is included in the response
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

module.exports = router;