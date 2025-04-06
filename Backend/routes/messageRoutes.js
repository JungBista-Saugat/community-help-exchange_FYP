// filepath: d:\community-help-exchange_FYP\Backend\routes\messageRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../models/messageModel');

router.get('/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

module.exports = router;