const express = require('express');
const router = express.Router();
const { getAdminStats, getAllUsers, settleDispute, refundDispute } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminStats);
router.get('/users', getAllUsers);
router.post('/settle-dispute/:rideId/:passengerId', settleDispute);
router.post('/refund-dispute/:rideId/:passengerId', refundDispute);

module.exports = router;
