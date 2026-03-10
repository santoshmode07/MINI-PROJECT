const express = require('express');
const router = express.Router();
const { offerRide, getAllRides, getRideById, getMyOffers } = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

// All ride routes are protected
router.use(protect);

router.post('/offer', offerRide);
router.get('/', getAllRides);
router.get('/my-offers', getMyOffers);
router.get('/:id', getRideById);

module.exports = router;
