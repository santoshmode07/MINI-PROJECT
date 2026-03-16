const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, updateLastRidesView } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.patch('/read', markAsRead);
router.patch('/last-rides-view', updateLastRidesView);

module.exports = router;
