#!/usr/bin/env node

const path = require("path");
const fs = require("fs/promises");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const {
  GROK_CRON_ENDPOINT,
  GROK_DIRECTORY_ENDPOINT,
  GROK_TARGET_FILE,
  GROK_TARGET_DIR,
  GROK_ADDITIONAL_INSTRUCTION,
  GROK_COMMIT_MESSAGE,
  GROK_GIT_REMOTE,
  GROK_GIT_BRANCH,
  GROK_GIT_WORKDIR,
} = process.env;

const parseCliArgs = (argv) => {
  const args = {};

  const setArg = (key, value) => {
    if (typeof value === "undefined") {
      return;
    }

    args[key] = value;
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (!token.startsWith("--")) {
      continue;
    }

    const [flag, inlineValue] = token.split("=", 2);
    let value = inlineValue;

    if (typeof value === "undefined") {
      const next = argv[i + 1];
      if (typeof next !== "undefined" && !next.startsWith("--")) {
        value = next;
        i += 1;
      }
    }

    if (typeof value === "undefined") {
      continue;
    }

    switch (flag) {
      case "--dir":
      case "--directory":
        setArg("targetDir", value);
        break;
      case "--file":
        setArg("targetFile", value);
        break;
      case "--instruction":
        setArg("instruction", value);
        break;
      case "--git-root":
      case "--git-workdir":
        setArg("gitWorkdir", value);
        break;
      default:
        break;
    }
  }

  return args;
};

const cliArgs = parseCliArgs(process.argv.slice(2));

const singleFileEndpoint =
  GROK_CRON_ENDPOINT || "http://127.0.0.1:3000/api/grok/refactor";
const directoryEndpoint =
  GROK_DIRECTORY_ENDPOINT ||
  "http://127.0.0.1:3000/api/grok/refactor-directory";

const targetFile =
  cliArgs.targetFile || GROK_TARGET_FILE || "sample-test.js";
const targetDirectory = (cliArgs.targetDir ||
  (typeof GROK_TARGET_DIR === "string" ? GROK_TARGET_DIR.trim() : "")).trim();
const useDirectoryMode = targetDirectory.length > 0;
const instruction =
  cliArgs.instruction || GROK_ADDITIONAL_INSTRUCTION || "";
const gitWorkdirInput =
  cliArgs.gitWorkdir ||
  GROK_GIT_WORKDIR ||
  "";

const toPosix = (maybePath) => maybePath.split(path.sep).join("/");

const resolvePathInRepo = (inputPath) => {
  const candidate = path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(repoRoot, inputPath);

  const normalizedRoot = repoRoot.endsWith(path.sep)
    ? repoRoot
    : `${repoRoot}${path.sep}`;

  if (!candidate.startsWith(normalizedRoot) && candidate !== repoRoot) {
    throw new Error(
      `Path ${inputPath} resolves outside of repository root (${repoRoot})`
    );
  }

  return candidate;
};

const gitWorkdir =
  gitWorkdirInput && gitWorkdirInput.trim().length > 0
    ? resolvePathInRepo(gitWorkdirInput.trim())
    : repoRoot;

const normalizeBasePath = (basePath) =>
  basePath.endsWith(path.sep) ? basePath : `${basePath}${path.sep}`;

const relativeToGitWorkdir = (inputPath) => {
  const absolutePath = path.isAbsolute(inputPath)
    ? path.resolve(inputPath)
    : resolvePathInRepo(inputPath);

  const normalizedWorkdir = normalizeBasePath(gitWorkdir);
  const normalizedPath = path.resolve(absolutePath);

  if (
    normalizedPath === gitWorkdir ||
    normalizedPath.startsWith(normalizedWorkdir)
  ) {
    return path.relative(gitWorkdir, normalizedPath) || ".";
  }

  throw new Error(
    `Path ${inputPath} is outside of git working directory (${gitWorkdir})`
  );
};

const getFetch = async () => {
  if (typeof globalThis.fetch === "function") {
    return globalThis.fetch;
  }

  if (getFetch.cached) {
    return getFetch.cached;
  }

  const mod = await import("node-fetch");
  const impl = mod.default || mod;

  if (typeof impl !== "function") {
    throw new Error("Failed to load fetch implementation");
  }

  getFetch.cached = impl;
  return impl;
};

const runGit = (args) => {
  const result = spawnSync("git", args, {
    cwd: gitWorkdir,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed with status ${result.status}`);
  }
};

const prepareGitTargets = (targets) => {
  return targets.map((target) => relativeToGitWorkdir(target));
};

const hasGitDiff = (targets) => {
  const targetList = Array.isArray(targets) ? targets : [targets];
  const filteredTargets = targetList.filter(
    (value) => typeof value === "string" && value.length > 0
  );

  if (filteredTargets.length === 0) {
    throw new Error("No git targets provided for diff check");
  }

  const gitTargets = prepareGitTargets(filteredTargets);

  const diffResult = spawnSync(
    "git",
    ["diff", "--quiet", "--exit-code", "HEAD", "--", ...gitTargets],
    {
      cwd: gitWorkdir,
    }
  );

  if (diffResult.status === 0) {
    return false;
  }

  if (diffResult.status === 1) {
    return true;
  }

  if (diffResult.status === 128 && !diffResult.error) {
    return true;
  }

  if (diffResult.error) {
    throw diffResult.error;
  }

  throw new Error("git diff failed to determine changes");
};

const callApi = async (url, body, fetchImpl) => {
  const response = await fetchImpl(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API request failed with status ${response.status}: ${errorText}`
    );
  }

  return response.json();
};

const processSingleFile = async (fetchImpl) => {
  const targetFilePath = resolvePathInRepo(targetFile);
  const gitRelativePath = relativeToGitWorkdir(targetFilePath);
  const sourceCode = await fs.readFile(targetFilePath, "utf8");

  const payload = await callApi(
    singleFileEndpoint,
    {
      code: sourceCode,
      instruction,
    },
    fetchImpl
  );

  const updatedCode = payload?.data?.processedCode;

  if (typeof updatedCode !== "string" || updatedCode.trim().length === 0) {
    throw new Error("API response does not include processed code content");
  }

  if (updatedCode === sourceCode) {
    console.log("No changes detected in processed code. Skipping commit.");
    return;
  }

  await fs.writeFile(targetFilePath, updatedCode, "utf8");

  if (!hasGitDiff(targetFilePath)) {
    console.log("File content is unchanged after write. Skipping commit.");
    return;
  }

  runGit(["add", gitRelativePath]);

  const commitMessage =
    GROK_COMMIT_MESSAGE || `chore: auto update ${gitRelativePath}`;
  runGit(["commit", "-m", commitMessage]);

  const pushArgs = ["push"];
  if (GROK_GIT_REMOTE) {
    pushArgs.push(GROK_GIT_REMOTE);
  }
  if (GROK_GIT_BRANCH) {
    if (pushArgs.length === 1) {
      pushArgs.push("origin");
    }
    pushArgs.push(GROK_GIT_BRANCH);
  }

  runGit(pushArgs);
  console.log(`Auto update completed for ${relativePathForGit}`);
};

const ensureWritableFile = async (relativePath, content) => {
  const absolutePath = resolvePathInRepo(relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content, "utf8");
  return absolutePath;
};

const processDirectory = async (fetchImpl) => {
  if (!useDirectoryMode) {
    throw new Error("Directory mode requested without GROK_TARGET_DIR");
  }

  const resolvedDirectory = resolvePathInRepo(targetDirectory);
  const relativeDir = path.relative(repoRoot, resolvedDirectory) || ".";
  const payload = await callApi(
    directoryEndpoint,
    {
      directoryPath: toPosix(relativeDir),
      instruction,
    },
    fetchImpl
  );

  const processedFiles = payload?.data?.files;

  if (!Array.isArray(processedFiles) || processedFiles.length === 0) {
    console.log("Directory endpoint returned no files. Skipping commit.");
    return;
  }

  console.log(
    `Applying updates for ${processedFiles.length} files under ${relativeDir}`
  );

  const writtenPaths = [];
  for (const file of processedFiles) {
    if (!file?.path || typeof file.code !== "string") {
      continue;
    }

    const absolutePath = await ensureWritableFile(file.path, file.code);
    writtenPaths.push(absolutePath);
  }

  const uniquePaths = [...new Set(writtenPaths.map((p) => path.resolve(p)))];

  if (uniquePaths.length === 0) {
    console.log("No files were written. Skipping commit.");
    return;
  }

  if (!hasGitDiff(uniquePaths)) {
    console.log("Processed files produced no diff. Skipping commit.");
    return;
  }

  const gitTargets = prepareGitTargets(uniquePaths);
  runGit(["add", ...gitTargets]);

  const commitMessage =
    GROK_COMMIT_MESSAGE ||
    `chore: auto update ${relativeDir} (${uniquePaths.length} files)`;
  runGit(["commit", "-m", commitMessage]);

  const pushArgs = ["push"];
  if (GROK_GIT_REMOTE) {
    pushArgs.push(GROK_GIT_REMOTE);
  }
  if (GROK_GIT_BRANCH) {
    if (pushArgs.length === 1) {
      pushArgs.push("origin");
    }
    pushArgs.push(GROK_GIT_BRANCH);
  }

  runGit(pushArgs);
  console.log(
    `Auto update completed for directory ${relativeDir} (${uniquePaths.length} files)`
  );
};

const main = async () => {
  const fetchImpl = await getFetch();

  if (useDirectoryMode) {
    await processDirectory(fetchImpl);
  } else {
    await processSingleFile(fetchImpl);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
