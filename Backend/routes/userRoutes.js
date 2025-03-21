const express = require("express");
const router = express.Router();
const { loginUser, registerUser, forgotPassword, resetPassword, getCurrentUser, updateProfile, verifyToken } = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Authentication routes
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post('/auth/verify', verifyToken);

// Token validation endpoint
router.post('/validate-token', authMiddleware, (req, res) => {
  res.status(200).json({
    valid: true,
    role: req.user.role,
    userId: req.user._id
  });
});

// Protected routes
router.get("/me", authMiddleware, getCurrentUser);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;