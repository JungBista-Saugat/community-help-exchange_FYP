const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Extract the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token

      req.user = await User.findById(decoded.id).select('-password'); // Attach user to request

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(403).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(403).json({ message: 'Not authorized, no token' });
  }
};

module.exports = protect;