const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

// Route for submitting a support inquiry
router.post('/submit', supportController.submitInquiry);

module.exports = router; 