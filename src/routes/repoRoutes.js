const express = require('express');
const { modifyRepoFileHandler } = require('../controllers/repoController');

const router = express.Router();

// Trigger Grok-based file modification and git push
router.post('/modify', modifyRepoFileHandler);

module.exports = router;
