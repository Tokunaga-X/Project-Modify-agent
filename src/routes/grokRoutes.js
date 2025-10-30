const express = require('express');
const { refactorCodeHandler } = require('../controllers/grokController');

const router = express.Router();

// Submit code to Grok for refactoring/commenting
router.post('/refactor', refactorCodeHandler);

module.exports = router;
