const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    markAsDroppedOff, 
    confirmArrival, 
    getDropoffStatus 
} = require('../controllers/dropoffController');

router.post('/driver/:rideId/:passengerId', protect, markAsDroppedOff);
router.post('/passenger/confirm/:rideId', protect, confirmArrival);
router.get('/status/:rideId', protect, getDropoffStatus);

module.exports = router;
