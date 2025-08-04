const jwt = require('jsonwebtoken');
const UserAccount = require('../db/model/userModel');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authorization token missing' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await UserAccount.findByPk(payload.id, {
        attributes: ['id', 'tokenVersion', 'role', 'banned', 'verified', 'username', 'pfp', 'password', 'createdAt']
    });
          
    if(!user) return res.status(401).json({ message: 'User not found' });
    if(!user.verified) return res.status(401).json({message: 'User not verified'});
    if(user.banned) return res.status(401).json({message: 'User banned'});

    if (payload.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = authMiddleware;
