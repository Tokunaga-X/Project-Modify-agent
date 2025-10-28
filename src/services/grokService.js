const axios = require('axios');
const AppError = require('../utils/appError');

const DEFAULT_MODEL = 'grok-beta';
const DEFAULT_URL = 'https://api.x.ai/v1/chat/completions';

/**
 * Call Grok AI to modify source code based on the provided instruction.
 * Returns raw text, extracting code blocks when present.
 */
const requestCodeModification = async ({
  code,
  instruction,
  model,
  filePath,
}) => {
  const apiKey = process.env.GROK_API_KEY;

  if (!apiKey) {
    throw new AppError('GROK_API_KEY is not set in environment variables', 500);
  }

  if (!code) {
    throw new AppError('Source code is required for Grok processing', 400);
  }

  const promptInstruction =
    instruction ||
    'Refactor this code to improve readability and add helpful inline comments.';

  try {
    const response = await axios.post(
      process.env.GROK_API_URL || DEFAULT_URL,
      {
        model: model || process.env.GROK_MODEL || DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are Grok, an AI pair programmer. Return only the updated code for the provided file. Do not include explanations unless the user explicitly requests them.',
          },
          {
            role: 'user',
            content: [
              `File path: ${filePath || 'unknown file'}`,
              'Instruction:',
              promptInstruction,
              '---',
              'Original code:',
              '```',
              code,
              '```',
            ].join('\n'),
          },
        ],
        temperature: 0.4,
        max_tokens: 4096,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new AppError('Grok AI did not return any content', 502);
    }

    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/;
    const match = content.match(codeBlockRegex);

    return match ? match[1].trim() : content.trim();
  } catch (error) {
    const status = error.response?.status;
    const detail =
      error.response?.data?.error?.message ||
      error.message ||
      'Unknown Grok API error';

    if (status && status < 500) {
      throw new AppError(`Grok API error: ${detail}`, status);
    }

    console.error('Error calling Grok API:', detail);
    throw new AppError('Failed to contact Grok AI service', 502);
  }
};

module.exports = {
  requestCodeModification,
};
