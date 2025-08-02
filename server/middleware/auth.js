const jwt = require('jsonwebtoken');
const { users } = require('../data/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Middleware to check if user is support agent or admin
const requireAgent = (req, res, next) => {
  if (req.user.role !== 'agent' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Support agent access required' });
  }
  next();
};

// Middleware to check if user owns the resource or is admin/agent
const requireOwnership = (req, res, next) => {
  const { id } = req.params;
  const { tickets } = require('../data/database');
  
  const ticket = tickets.find(t => t.id === id);
  
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  // Admin and agents can access any ticket
  if (req.user.role === 'admin' || req.user.role === 'agent') {
    req.ticket = ticket;
    return next();
  }

  // Regular users can only access their own tickets
  if (ticket.userId === req.user.id) {
    req.ticket = ticket;
    return next();
  }

  return res.status(403).json({ message: 'Access denied' });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAgent,
  requireOwnership
}; 