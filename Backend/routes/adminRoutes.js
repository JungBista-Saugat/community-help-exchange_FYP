const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { createVolunteerPost, approveApplication, getVolunteerPosts } = require('../controllers/adminController');

// Admin-protected routes
router.get('/volunteer-posts', authMiddleware, adminMiddleware, getVolunteerPosts);
router.post('/volunteer-posts', authMiddleware, adminMiddleware, createVolunteerPost);
router.put('/volunteer-posts/:postId/applications/:applicationId/approve', authMiddleware, adminMiddleware, approveApplication);
router.put('/volunteer-posts/:postId/applications/:applicationId/reject', authMiddleware, adminMiddleware, (req, res) => {
  //  reject application logic is to be added
});

module.exports = router;