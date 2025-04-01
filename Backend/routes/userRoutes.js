const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
    loginUser, 
    registerUser, 
    forgotPassword, 
    resetPassword,
    getCurrentUserProfile, 
    updateProfile, 
    validateToken 
} = require("../controllers/userController");

// Validate token
router.get('/validateToken', validateToken);

// Get current user's profile
router.get('/profile', authMiddleware, getCurrentUserProfile);

// Authentication routes
router.post("/login", loginUser);
router.post("/signup", registerUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Protected routes
router.get("/me", authMiddleware, getCurrentUserProfile);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;