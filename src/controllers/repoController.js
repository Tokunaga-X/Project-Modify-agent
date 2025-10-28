const { modifyFileWithGrok } = require('../services/repoModifyService');
const AppError = require('../utils/appError');

const modifyRepoFileHandler = async (req, res, next) => {
  try {
    const {
      repoPath,
      targetFile,
      instruction,
      commitMessage,
      model,
    } = req.body || {};

    if (!repoPath && !process.env.DEFAULT_REPO_PATH) {
      throw new AppError(
        'repoPath is required in the request body or DEFAULT_REPO_PATH must be set in the environment.',
        400
      );
    }

    const result = await modifyFileWithGrok({
      repoPath,
      targetFile,
      instruction,
      commitMessage,
      model,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  modifyRepoFileHandler,
};
