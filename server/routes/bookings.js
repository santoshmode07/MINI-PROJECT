const express = require('express');
const router = express.Router();
const { 
  bookRide, 
  getMyBookings, 
  cancelBooking, 
  getPassengerList 
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/bookings
 * @desc    Book a new ride
 * @access  Private
 */
router.post('/', protect, bookRide);

/**
 * @route   GET /api/bookings/my
 * @desc    Get user's current/upcoming bookings
 * @access  Private
 */
router.get('/my', protect, getMyBookings);

/**
 * @route   DELETE /api/bookings/:rideId
 * @desc    Cancel an active booking before departure
 * @access  Private
 */
router.delete('/:rideId', protect, cancelBooking);

/**
 * @route   GET /api/bookings/ride/:rideId
 * @desc    Get confirmed passenger list for a specific ride (Driver only)
 * @access  Private (Driver)
 */
router.get('/ride/:rideId', protect, getPassengerList);

module.exports = router;
