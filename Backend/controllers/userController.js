// Importing required modules
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// User login controller
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { ...user._doc, password: undefined } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// User registration controller
const registerUser = async (req, res) => {
  const { name, email, password, address, contactNumber, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, address, contactNumber, role });

    // Save the new user to the database
    await newUser.save();

    // Send response with the newly created user data
    res.status(201).json(newUser);
  } catch (error) {
    // Handle any server-side errors
    res.status(400).json({ message: error.message });
  }
};

// Forgot password controller (Sends a password reset email)
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Construct the reset URL to be sent in the email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Configure Nodemailer to send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send the email with the reset password link
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `Click <a href='${resetUrl}'>here</a> to reset your password.`
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset password controller (Handles password change using a reset token)
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() } // Check if the token has expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password and save it
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user); // Ensure `completedProfile` is included in the response
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile controller
const updateProfile = async (req, res) => {
  try {
    const { skills, interests, bio, profilePicture, completedProfile } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        skills: skills || [],
        interests: interests || [],
        bio: bio || '',
        profilePicture: profilePicture || '',
        completedProfile: completedProfile || false // Update completedProfile
      },
      { new: true } // Return the updated user
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Validate JWT token
const validateToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all users controller
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Exporting the functions so they can be used in routes

module.exports = { 
  loginUser, 
  registerUser, 
  forgotPassword, 
  resetPassword, 
  getCurrentUserProfile, 
  updateProfile, 
  validateToken, 
  getUsers 
};
