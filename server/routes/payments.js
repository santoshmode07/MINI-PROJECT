const express = require('express');
const router = express.Router();
const { createTopUpIntent, getWalletStatement, requestWithdrawal, getPayoutRequests, updatePayoutStatus, getWalletBalance } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/wallet', protect, getWalletBalance);
router.post('/topup/intent', protect, createTopUpIntent);
router.post('/topup/confirm', protect, exports.confirmTopUp || require('../controllers/paymentController').confirmTopUp);
router.get('/wallet/statement', protect, getWalletStatement);
router.post('/withdraw', protect, requestWithdrawal);
router.get('/payouts', protect, authorize('admin'), getPayoutRequests);
router.put('/payouts/:id', protect, authorize('admin'), updatePayoutStatus);

module.exports = router;
