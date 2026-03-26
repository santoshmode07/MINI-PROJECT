const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    authUser, 
    logoutUser, 
    getUserProfile,
    topUpWallet,
    getMyTransactions
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Route: /api/auth
 */
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getUserProfile);
router.post('/wallet/topup', protect, topUpWallet);
router.get('/wallet/transactions', protect, getMyTransactions);

module.exports = router;
