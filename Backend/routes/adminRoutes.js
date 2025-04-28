const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { 
  createVolunteerPost, 
  approveApplication, 
  rejectApplication,
  getVolunteerPosts, 
  getApplications, 
  getPublicVolunteerPosts, 
  applyForVolunteerPost 
} = require('../controllers/adminController');

// Public route for viewing volunteer posts (needs auth for application status)
router.get('/public/volunteer-posts', authMiddleware, getPublicVolunteerPosts);

// User route for applying to volunteer posts
router.post('/volunteer-posts/:postId/apply', authMiddleware, applyForVolunteerPost);

// Admin-protected routes
router.get('/volunteer-posts', authMiddleware, adminMiddleware, getVolunteerPosts);
router.post('/volunteer-posts', authMiddleware, adminMiddleware, createVolunteerPost);
router.put('/volunteer-posts/:postId/applications/:applicationId/approve', authMiddleware, adminMiddleware, approveApplication);
router.put('/volunteer-posts/:postId/applications/:applicationId/reject', authMiddleware, adminMiddleware, rejectApplication);

// Get all applications (admin only)
router.get('/applications', authMiddleware, adminMiddleware, getApplications);

module.exports = router;