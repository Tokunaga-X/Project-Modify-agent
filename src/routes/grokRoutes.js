const express = require('express');
const {
  refactorCodeHandler,
  refactorDirectoryHandler,
} = require('../controllers/grokController');

const router = express.Router();

// Submit single file to Grok for refactoring/commenting
router.post('/refactor', refactorCodeHandler);

// Submit an entire directory worth of files for holistic processing
router.post('/refactor-directory', refactorDirectoryHandler);

module.exports = router;
