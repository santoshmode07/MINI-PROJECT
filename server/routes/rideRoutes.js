const express = require('express');
const router = express.Router();
const { 
  offerRide, 
  getAllRides, 
  getRideById, 
  getMyOffers, 
  cancelRide, 
  getDriverStats,
  getPredictedPrice
} = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

// All ride routes are protected
router.use(protect);

router.post('/offer', offerRide);
router.post('/predict-price', getPredictedPrice);
router.get('/', getAllRides);
router.get('/my-offers', getMyOffers);
router.get('/driver-stats', getDriverStats);
router.patch('/:id/cancel', cancelRide);
router.patch('/:id/complete', require('../controllers/rideController').completeRide);
router.post('/:id/no-show', require('../controllers/rideController').reportNoShow);
router.get('/:id', getRideById);

module.exports = router;
