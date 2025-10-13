const express = require('express');
const { processCodeHandler } = require('../controllers/codeController');

const router = express.Router();

// Process code with AI
router.post('/process', processCodeHandler);

module.exports = router;
