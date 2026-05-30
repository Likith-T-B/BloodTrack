const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Protect routes middleware
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretbloodbankjwttokenkey1234!');

      if (db.isMock()) {
        const users = db.mockDb.readTable('users');
        const user = users.find(u => String(u.id) === String(decoded.id));
        if (!user) {
          return res.status(401).json({ success: false, message: 'User not found, unauthorized' });
        }
        req.user = { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city };
      } else {
        const rows = await db.query('SELECT id, name, email, role, city FROM users WHERE id = ?', [decoded.id]);
        if (rows.length === 0) {
          return res.status(401).json({ success: false, message: 'User not found, unauthorized' });
        }
        req.user = rows[0];
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Role authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
