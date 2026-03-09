const express = require('express');
const router = express.Router();
const { offerRide, getAllRides, getRideById, getMyOffers, getMyBookings, bookRide, cancelBooking } = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

// All ride routes are protected
router.use(protect);

router.post('/offer', offerRide);
router.post('/book/:id', bookRide); // New booking endpoint
router.put('/cancel/:id', cancelBooking); // New cancel endpoint
router.get('/', getAllRides);
router.get('/my-offers', getMyOffers);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getRideById);

module.exports = router;
