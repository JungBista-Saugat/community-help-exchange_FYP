const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all notifications for the authenticated user
router.get('/', authMiddleware, notificationController.getUserNotifications);

// Get unread notification count
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);

// Mark notification as read
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

module.exports = router; 