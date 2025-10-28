const fs = require('fs/promises');
const path = require('path');
const simpleGit = require('simple-git');
const AppError = require('../utils/appError');
const { requestCodeModification } = require('./grokService');

const resolveRepoPath = (repoPath) => {
  if (!repoPath) {
    throw new AppError(
      'Repository path is required. Provide repoPath in the request body or set DEFAULT_REPO_PATH in the environment.',
      400
    );
  }

  return path.resolve(repoPath);
};

const ensureFileExists = async (filePath) => {
  try {
    await fs.access(filePath);
  } catch (error) {
    throw new AppError(`Target file not found at path: ${filePath}`, 404);
  }
};

const modifyFileWithGrok = async ({
  repoPath,
  targetFile,
  instruction,
  commitMessage,
  model,
}) => {
  const baseRepoPath =
    resolveRepoPath(repoPath || process.env.DEFAULT_REPO_PATH);

  if (!targetFile && !process.env.DEFAULT_TARGET_FILE) {
    throw new AppError(
      'Target file is required. Provide targetFile in the request body or set DEFAULT_TARGET_FILE in the environment.',
      400
    );
  }

  const relativeFilePath = targetFile || process.env.DEFAULT_TARGET_FILE;
  const filePath = path.join(baseRepoPath, relativeFilePath);

  await ensureFileExists(filePath);

  const originalCode = await fs.readFile(filePath, 'utf8');

  const updatedCode = await requestCodeModification({
    code: originalCode,
    instruction,
    model,
    filePath: relativeFilePath,
  });

  if (!updatedCode) {
    throw new AppError('Grok AI returned empty content', 502);
  }

  if (updatedCode.trim() === originalCode.trim()) {
    return {
      message: 'Grok AI returned identical content; skipping git operations.',
      updated: false,
    };
  }

  await fs.writeFile(filePath, updatedCode, 'utf8');

  const git = simpleGit({ baseDir: baseRepoPath });
  const statusPreAdd = await git.status();

  await git.add(relativeFilePath);

  const statusPostAdd = await git.status();

  if (statusPostAdd.staged.length === 0 && statusPostAdd.files.length === 0) {
    return {
      message:
        'File updated on disk but git detected no staged changes; commit skipped.',
      updated: true,
    };
  }

  const commitMsg =
    commitMessage ||
    `chore: automated update for ${relativeFilePath} via Grok AI`;

  await git.commit(commitMsg);

  const pushResult = await git.push();

  return {
    message: 'File modified, committed, and pushed successfully.',
    updated: true,
    commit: commitMsg,
    gitStatusBefore: statusPreAdd,
    gitStatusAfter: statusPostAdd,
    pushResult,
  };
};

module.exports = {
  modifyFileWithGrok,
};
