const jwt = require('jsonwebtoken');

// Middleware to verify JWT from cookies
const authMiddleware = (req, res, next) => {
  // Get token from cookies
  const token = req.header('Authorization');

  // Check if the token is missing
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token and extract user data
    const decoded = jwt.verify(token, process.env.KEY);
    
    // Attach user info to the request object (available in routes)
    // req.user = decoded.user;
    req.user = decoded.user;
    // console.log(req.user)
    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    // Token is invalid
    console.log(err)
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
