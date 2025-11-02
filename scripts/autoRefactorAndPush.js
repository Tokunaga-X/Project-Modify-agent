#!/usr/bin/env node

const path = require("path");
const fs = require("fs/promises");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const {
  GROK_CRON_ENDPOINT,
  GROK_TARGET_FILE,
  GROK_ADDITIONAL_INSTRUCTION,
  GROK_COMMIT_MESSAGE,
  GROK_GIT_REMOTE,
  GROK_GIT_BRANCH,
} = process.env;

const endpoint =
  GROK_CRON_ENDPOINT || "http://127.0.0.1:3000/api/grok/refactor";
const targetFile = GROK_TARGET_FILE || "sample-test.js";
const instruction = GROK_ADDITIONAL_INSTRUCTION || "";

const targetFilePath = path.isAbsolute(targetFile)
  ? targetFile
  : path.resolve(repoRoot, targetFile);

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
    cwd: repoRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed with status ${result.status}`);
  }
};

const hasGitDiff = (relativePath) => {
  const diffResult = spawnSync(
    "git",
    ["diff", "--quiet", "--exit-code", "HEAD", "--", relativePath],
    {
      cwd: repoRoot,
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

const main = async () => {
  const relativePathForGit = path.relative(repoRoot, targetFilePath);
  const sourceCode = await fs.readFile(targetFilePath, "utf8");
  const fetchImpl = await getFetch();

  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: sourceCode,
      instruction,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API request failed with status ${response.status}: ${errorText}`
    );
  }

  const payload = await response.json();
  const updatedCode = payload?.data?.processedCode;

  if (typeof updatedCode !== "string" || updatedCode.trim().length === 0) {
    throw new Error("API response does not include processed code content");
  }

  if (updatedCode === sourceCode) {
    console.log("No changes detected in processed code. Skipping commit.");
    return;
  }

  await fs.writeFile(targetFilePath, updatedCode, "utf8");

  if (!hasGitDiff(relativePathForGit)) {
    console.log("File content is unchanged after write. Skipping commit.");
    return;
  }

  runGit(["add", relativePathForGit]);

  const commitMessage =
    GROK_COMMIT_MESSAGE || `chore: auto update ${relativePathForGit}`;
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
