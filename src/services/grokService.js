const AppError = require("../utils/appError");
const { HttpsProxyAgent } = require("https-proxy-agent");

const DEFAULT_MODEL = "grok-4";
const DEFAULT_PROXY_URL = "http://127.0.0.1:7890";

const extractTextFromResponse = (data) => {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (data.text) return data.text;
  if (data.output_text) return data.output_text;
  return JSON.stringify(data);
};

let cachedClient;

const resolveProxyUrl = () => {
  const candidates = [
    process.env.GROK_PROXY_URL,
    process.env.HTTPS_PROXY,
    process.env.HTTP_PROXY,
  ].filter((value) => typeof value === "string" && value.trim().length > 0);

  if (candidates.length === 0) {
    return DEFAULT_PROXY_URL;
  }

  const selected = candidates[0].trim();
  const offSignals = new Set(["none", "off", "disable", "direct"]);
  return offSignals.has(selected.toLowerCase()) ? undefined : selected;
};

const initClient = async (apiKey) => {
  if (cachedClient && cachedClient.apiKey === apiKey) {
    return cachedClient;
  }

  const [xaiModule, aiModule, fetchModule] = await Promise.all([
    import("@ai-sdk/xai"),
    import("ai"),
    import("node-fetch"),
  ]);

  const { createXai } = xaiModule;
  const { generateText } = aiModule;
  const fetchImpl = fetchModule.default;

  const proxyUrl = resolveProxyUrl();
  const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
  const fetchWithProxy = agent
    ? (input, init) => fetchImpl(input, { ...(init || {}), agent })
    : fetchImpl;

  const baseURL =
    process.env.GROK_API_URL && process.env.GROK_API_URL.trim().length > 0
      ? process.env.GROK_API_URL.trim()
      : undefined;

  const xaiConfig = {
    apiKey,
    fetch: fetchWithProxy,
  };

  if (baseURL) {
    xaiConfig.baseURL = baseURL;
  }

  const xai = createXai(xaiConfig);

  cachedClient = {
    apiKey,
    xai,
    generateText,
    proxyUrl,
    baseURL,
  };

  return cachedClient;
};

/**
 * Call Grok AI to modify source code based on the provided instruction.
 * Returns raw text, extracting code blocks when present.
 */
const BASE_PROMPT_INSTRUCTION =
  [
    "Apply improvements by refactoring the implementation, adding explanatory comments, introducing new functionality or features when appropriate, and creating relevant test cases.",
    "Only modify the provided file content—do not create new files or mention files you cannot edit.",
    "Return the complete updated code without any change annotations or explanations.",
    "Limit your edits to at most 30 lines of code per file and focus on a single coherent change such as one feature addition, one new comment block, one documentation update, or one test addition.",
  ].join(" ");

const requestCodeModification = async ({
  code,
  instruction,
  model,
  filePath,
}) => {
  const rawApiKey = process.env.GROK_API_KEY;
  const apiKey = rawApiKey ? rawApiKey.trim() : undefined;

  if (!apiKey) {
    throw new AppError("GROK_API_KEY is not set in environment variables", 500);
  }

  if (!code) {
    throw new AppError("Source code is required for Grok processing", 400);
  }

  const promptInstruction = instruction
    ? `${BASE_PROMPT_INSTRUCTION}\nAdditional user request: ${instruction}`
    : BASE_PROMPT_INSTRUCTION;

  try {
    const resolvedModel = model || process.env.GROK_MODEL || DEFAULT_MODEL;
    const client = await initClient(apiKey);

    console.log("[GrokRepo] Requesting Grok AI", {
      model: resolvedModel,
      apiKeyPreview: `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`,
      baseURL: client.baseURL || "default",
      proxy: client.proxyUrl || "direct",
      filePath: filePath || "unknown file",
      instruction: promptInstruction,
    });

    const { text: responseText } = await client.generateText({
      model: client.xai(resolvedModel),
      prompt: [
        "You are Grok, an AI pair programmer. Return only the updated code for the provided file.",
        "Do not include explanations unless the user explicitly requests them.",
        "",
        `File path: ${filePath || "unknown file"}`,
        "Instruction:",
        promptInstruction,
        "---",
        "Original code:",
        "```",
        code,
        "```",
      ].join("\n"),
      maxTokens: 4096,
      temperature: 0.4,
    });

    const content = extractTextFromResponse(responseText);

    if (!content) {
      throw new AppError("Grok AI did not return any content", 502);
    }

    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/;
    const match = content.match(codeBlockRegex);

    const finalResult = match ? match[1].trim() : content.trim();

    console.log("[GrokRepo] Response received", {
      filePath: filePath || "unknown file",
      instruction: promptInstruction,
      characters: finalResult.length,
    });

    return finalResult;
  } catch (error) {
    console.error("Error calling Grok API:", {
      message: error.message,
      stack: error.stack,
    });
    throw new AppError("Failed to contact Grok AI service", 502);
  }
};

const BATCH_PROMPT_INSTRUCTION =
  [
    "You will receive multiple JavaScript source files from the same project.",
    "Consider interactions between files and apply holistic improvements such as refactors, added comments, bug fixes, or new helper utilities.",
    "Return the updated code for every provided file, even if the content is unchanged, using the following strict format:",
    "FILE: relative/path.js",
    "```javascript",
    "complete updated code for that file",
    "```",
    "Do not mention files that were not supplied and avoid any explanations outside the required format.",
    "Limit total edits to at most 30 lines per file and keep each run focused on a single cohesive change (one feature, one comment addition, one documentation update, or one test).",
  ].join(" ");

const formatFilesForPrompt = (files) =>
  files
    .map(
      ({ path: filePath, code }) =>
        [
          `FILE: ${filePath}`,
          "```javascript",
          code,
          "```",
        ].join("\n")
    )
    .join("\n\n");

const parseBatchResponse = (content) => {
  const fileBlocks = [];
  const regex =
    /FILE:\s*([^\n]+)\n```(?:[\w#+-]+)?\n([\s\S]*?)```/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    const relativePath = match[1].trim();
    const updatedCode = match[2].trim();

    if (relativePath && updatedCode) {
      fileBlocks.push({
        path: relativePath,
        code: updatedCode,
      });
    }
  }

  return fileBlocks;
};

const requestProjectModification = async ({
  files,
  instruction,
  model,
}) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new AppError(
      "At least one file is required for batch refactoring",
      400
    );
  }

  const rawApiKey = process.env.GROK_API_KEY;
  const apiKey = rawApiKey ? rawApiKey.trim() : undefined;

  if (!apiKey) {
    throw new AppError("GROK_API_KEY is not set in environment variables", 500);
  }

  const promptInstruction = instruction
    ? `${BATCH_PROMPT_INSTRUCTION}\nAdditional user request: ${instruction}`
    : BATCH_PROMPT_INSTRUCTION;

  try {
    const resolvedModel = model || process.env.GROK_MODEL || DEFAULT_MODEL;
    const client = await initClient(apiKey);
    const prompt = [
      "You are Grok, an AI pair programmer. Analyze the following project files together before returning updates.",
      promptInstruction,
      "",
      `File count: ${files.length}`,
      "---",
      formatFilesForPrompt(files),
    ].join("\n");

    console.log("[GrokRepo] Requesting Grok AI for batch update", {
      model: resolvedModel,
      files: files.length,
      instruction: promptInstruction.slice(0, 120),
    });

    const { text: responseText } = await client.generateText({
      model: client.xai(resolvedModel),
      prompt,
      maxTokens: 8192,
      temperature: 0.35,
    });

    const content = extractTextFromResponse(responseText);

    if (!content) {
      throw new AppError("Grok AI did not return any content", 502);
    }

    const parsedFiles = parseBatchResponse(content);

    if (!parsedFiles.length) {
      throw new AppError("Grok AI did not return any file updates", 502);
    }

    const incomingMap = new Map(
      parsedFiles.map((file) => [file.path.trim(), file.code])
    );

    return files.map((file) => {
      const updatedCode = incomingMap.get(file.path.trim());

      if (!updatedCode) {
        console.warn("[GrokRepo] Missing file in response", file.path);
      }

      return {
        path: file.path,
        code: updatedCode || file.code,
      };
    });
  } catch (error) {
    console.error("Error calling Grok API (batch):", {
      message: error.message,
      stack: error.stack,
    });
    throw new AppError("Failed to contact Grok AI service", 502);
  }
};

module.exports = {
  requestCodeModification,
  requestProjectModification,
};
