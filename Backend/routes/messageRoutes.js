// filepath: d:\community-help-exchange_FYP\Backend\routes\messageRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { 
    createMessage,
    getMessagesBetweenUsers,
    getUserMessages
} = require('../controllers/messageController');

// Create a new message
router.post('/', protect, createMessage);

// Get messages between two users
router.get('/conversation/:userId1/:userId2', protect, getMessagesBetweenUsers);

// Get all messages for a user
router.get('/user/:userId', protect, getUserMessages);

module.exports = router;