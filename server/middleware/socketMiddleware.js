const jwt = require('jsonwebtoken');

const socketMiddleware = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.log('[Socket Auth] No token provided');
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    console.log('[Socket Auth] Invalid token');
    return next(new Error('Authentication error: Invalid token'));
  }
};

module.exports = socketMiddleware;
