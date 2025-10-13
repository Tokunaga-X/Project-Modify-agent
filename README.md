# Code AI Service

A Node.js backend service that processes code using OpenAI's API. This service allows users to submit code and get AI-powered improvements, documentation, or test cases in return.

## Features

- Process code with AI-powered improvements
- Add documentation and comments
- Generate test cases
- Refactor and optimize code
- RESTful API for easy integration
- Error handling and input validation

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenAI API key

## Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:Tokunaga-X/Project-Modify-agent.git
   cd Project-Modify-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. The server will start on `http://localhost:3000`

## API Endpoints

### Process Code

**POST** `/api/code/process`

Process code with AI-powered improvements.

**Request Body:**
```json
{
  "code": "function add(a, b) { return a + b; }",
  "instruction": "Add JSDoc comments and a test case for this function."
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "processedCode": "/**\n     * Adds two numbers together.\n     * @param {number} a - The first number.\n     * @param {number} b - The second number.\n     * @returns {number} The sum of the two numbers.\n     */\n    function add(a, b) { \n      return a + b; \n    }\n    \n    // Test case\n    console.assert(add(2, 3) === 5, '2 + 3 should equal 5');"
  }
}
```

## Available Instructions

You can use the following instructions (or combine them):

- "Add comments and documentation"
- "Refactor this code for better performance"
- "Add error handling"
- "Write test cases for this code"
- "Convert this to TypeScript"
- "Optimize this code"
- "Explain what this code does"

## Environment Variables

- `PORT` - Port number the server will run on (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `OPENAI_API_KEY` - Your OpenAI API key

## Development

1. Install development dependencies:
   ```bash
   npm install
   ```

2. Start the development server with hot-reload:
   ```bash
   npm run dev
   ```

## Testing

To run tests:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with Node.js and Express
- Powered by OpenAI's GPT models
- Error handling with custom middleware
