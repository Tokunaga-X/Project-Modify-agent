const { Configuration, OpenAIApi } = require('openai');
const AppError = require('../utils/appError');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const processCode = async (code, instruction = '') => {
  try {
    const prompt = `You are a helpful code assistant. ${instruction} The code is: \n\`\`\`\n${code}\n\`\`\``;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful code assistant that helps improve, refactor, document, or add tests to code.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 2048,
    });

    const processedCode = response.data.choices[0]?.message?.content;
    
    if (!processedCode) {
      throw new AppError('No response from AI service', 500);
    }

    // Extract code from markdown code blocks if present
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/;
    const match = processedCode.match(codeBlockRegex);
    
    return match ? match[1].trim() : processedCode.trim();
  } catch (error) {
    console.error('Error processing code with OpenAI:', error);
    throw new AppError('Failed to process code with AI service', 500);
  }
};

module.exports = {
  processCode,
};
