const path = require('path');
const fs = require('fs/promises');
const {
  requestCodeModification,
  requestProjectModification,
} = require('../services/grokService');
const AppError = require('../utils/appError');

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const SAMPLE_FILE_PATH = path.resolve(PROJECT_ROOT, 'sample-test.js');
const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.turbo',
]);

const ensurePathWithinProject = (targetPath) => {
  const normalizedPath = path.resolve(PROJECT_ROOT, targetPath || '');
  const rootWithSeparator = PROJECT_ROOT.endsWith(path.sep)
    ? PROJECT_ROOT
    : `${PROJECT_ROOT}${path.sep}`;

  const isSameDirectory = normalizedPath === PROJECT_ROOT;
  const isChildPath = normalizedPath.startsWith(rootWithSeparator);

  if (!isSameDirectory && !isChildPath) {
    throw new AppError('Directory path must be inside the project root', 400);
  }

  return normalizedPath;
};

const collectJsFiles = async (directoryPath) => {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files = [];
  const allowedExtensions = new Set(['.js', '.ts', '.tsx']);

  await Promise.all(
    entries.map(async (entry) => {
      if (entry.isSymbolicLink()) {
        return;
      }

      const entryPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name)) {
          return;
        }

        const nestedFiles = await collectJsFiles(entryPath);
        files.push(...nestedFiles);
        return;
      }

      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (allowedExtensions.has(ext)) {
          files.push(entryPath);
        }
      }
    })
  );

  return files;
};

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

const refactorDirectoryHandler = async (req, res, next) => {
  try {
    const { directoryPath, instruction, model } = req.body || {};

    if (!directoryPath || typeof directoryPath !== 'string') {
      throw new AppError('directoryPath is required for batch refactoring', 400);
    }

    const resolvedDirectory = ensurePathWithinProject(directoryPath);
    const stat = await fs.stat(resolvedDirectory).catch(() => null);

    if (!stat || !stat.isDirectory()) {
      throw new AppError('Provided directoryPath does not exist or is not a directory', 400);
    }

    const jsFiles = await collectJsFiles(resolvedDirectory);

    if (jsFiles.length === 0) {
      throw new AppError('No JavaScript files found in the specified directory', 400);
    }

    const fileEntries = await Promise.all(
      jsFiles.map(async (absolutePath) => {
        const code = await fs.readFile(absolutePath, 'utf8');
        const relativePath = path.relative(PROJECT_ROOT, absolutePath);
        return {
          path: relativePath,
          code,
        };
      })
    );

    const processedFiles = await requestProjectModification({
      files: fileEntries,
      instruction,
      model,
    });

    res.status(200).json({
      status: 'success',
      data: {
        files: processedFiles,
        fileCount: processedFiles.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  refactorCodeHandler,
  refactorDirectoryHandler,
};
