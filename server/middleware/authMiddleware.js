const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Check for JWT in cookie or Authorization header
 */
const protect = async (req, res, next) => {
    let token;

    // Try to get token from cookie or Authorization header
    token = req.cookies.jwt || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null);

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Not authorized, user not found' 
                });
            }
            
            next();
        } catch (error) {
            console.error('Auth middleware error:', error.message);
            res.status(401).json({ 
                success: false, 
                message: 'Not authorized, token failed' 
            });
        }
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Not authorized, no token' 
        });
    }
};

module.exports = { protect };
