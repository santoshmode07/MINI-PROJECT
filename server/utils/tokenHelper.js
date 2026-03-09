const jwt = require('jsonwebtoken');

/**
 * Generate JWT token and set cookie
 * @param {Response} res - Express response object
 * @param {String} userId - User ID to embed in token
 * @returns {String} token
 */
const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    // Set cookie
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure in production
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return token;
};

module.exports = generateToken;
