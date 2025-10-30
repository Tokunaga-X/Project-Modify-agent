const path = require('path');
const fs = require('fs/promises');
const { requestCodeModification } = require('../services/grokService');
const AppError = require('../utils/appError');

const SAMPLE_FILE_PATH = path.resolve(__dirname, '../../sample-test.js');

const refactorCodeHandler = async (req, res, next) => {
  try {
    const { code, instruction, model } = req.body || {};

    let sourceCode = code;
    let effectiveFilePath = 'inline-request';

    if (!sourceCode || typeof sourceCode !== 'string') {
      sourceCode = await fs.readFile(SAMPLE_FILE_PATH, 'utf8');
      effectiveFilePath = 'sample-test.js';
    }

    const processedCode = await requestCodeModification({
      code: sourceCode,
      instruction,
      model,
      filePath: effectiveFilePath,
    });

    res.status(200).json({
      status: 'success',
      data: {
        processedCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  refactorCodeHandler,
};
