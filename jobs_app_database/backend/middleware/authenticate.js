const jwt = require('jsonwebtoken');

// PUBLIC_INTERFACE
function authenticateJWT(req, res, next) {
  /** JWT authentication middleware.
   * Checks for token in Authorization header and verifies it.
   */
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey123");
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticateJWT };
