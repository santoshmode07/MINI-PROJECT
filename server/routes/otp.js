const express = require('express');
const router = express.Router();
const { getBoardingDetails, verifyOTP, markArrived } = require('../controllers/otpController');
const { protect } = require('../middleware/authMiddleware');

router.get('/boarding/:rideId', protect, getBoardingDetails);
router.post('/verify', protect, verifyOTP);
router.post('/mark-arrived/:rideId', protect, markArrived);

module.exports = router;
