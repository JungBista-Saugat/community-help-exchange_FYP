const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No authentication token found in cookies or headers' });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select('-password -refreshToken');

    if (!user) {
      return res.status(401).json({ error: 'Invalid session - please login again' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired - please login again' });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { authMiddleware };