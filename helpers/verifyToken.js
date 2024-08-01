const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = localStorage.get('token');
  if (!token) {
    return res.status(401).json({ status: "error", error: "Unauthorized: No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: "error", error: "Unauthorized: Invalid token" });
    }
    req.userId = decoded.id;
    next();
  });
};

module.exports = verifyToken;
