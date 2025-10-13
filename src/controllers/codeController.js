const { processCode } = require('../services/codeService');
const AppError = require('../utils/appError');

const processCodeHandler = async (req, res, next) => {
  try {
    const { code, instruction } = req.body;

    if (!code) {
      return next(new AppError('Please provide the code to process', 400));
    }

    const processedCode = await processCode(code, instruction);

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
  processCodeHandler,
};
