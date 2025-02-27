// api/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function extendRequest(req) {
  // Create a simple object to mimic Express Request with user property
  return {
    ...req,
    user: undefined,
    headers: req.headers || {},
    body: req.body || {},
    method: req.method || 'GET',
    url: req.url || '/',
  };
}

const verifyToken = (req, res, next) => {
  try {
    const extendedReq = extendRequest(req);
    const token = extendedReq.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    extendedReq.user = { userId: decoded.userId };
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = { verifyToken };