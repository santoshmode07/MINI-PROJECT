const express = require('express');
const router = express.Router();
const ragController = require('../controllers/ragController');

// Main chat route
router.post('/chat', ragController.chat);

// Clear chat history
router.post('/clear-history', ragController.clearHistory);

module.exports = router;
