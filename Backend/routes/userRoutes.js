const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); // Import the correct middleware
const User = require('../models/userModel');
const { 
    loginUser, 
    registerUser, 
    forgotPassword, 
    resetPassword,
    getCurrentUserProfile, 
    updateProfile, 
    validateToken,
    getUsers
} = require("../controllers/userController");

// Validate token
router.get('/validateToken', validateToken);

// Get current user's profile
router.get('/profile', protect, getCurrentUserProfile);

// Authentication routes
router.post("/login", loginUser);
router.post("/signup", registerUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Protected routes
router.get("/me", protect, getUsers);
router.put("/profile", protect, updateProfile); // Update user profile


// Get all users
router.get('/', protect, getUsers);

// Get nearby users
router.get('/nearby', async (req, res) => {
  const { longitude, latitude, maxDistance } = req.query;

  if (!longitude || !latitude) {
    return res.status(400).json({ message: 'Longitude and latitude are required' });
  }

  try {
    const users = await User.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance) || 5000 // Default to 5km
        }
      }
    }).select('-password'); // Exclude sensitive fields

    res.json(users);
  } catch (error) {
    console.error('Error finding nearby users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user location
router.put('/location', protect, async (req, res) => {
  const { longitude, latitude } = req.body;

  if (!longitude || !latitude) {
    return res.status(400).json({ message: 'Longitude and latitude are required' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { location: { type: 'Point', coordinates: [longitude, latitude] } },
      { new: true }
    );

    res.json(user);
  } catch (error) {
    console.error('Error updating user location:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;