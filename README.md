# Grok Refactor Service

A minimal Node.js backend that sends code snippets to xAI Grok for refactoring or annotation and returns the AI response.

## Features

- Accept raw source code and optional instructions
- Call Grok and stream back the refactored code snippet
- RESTful API that is easy to script or automate
- Centralized error handling and input validation

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- xAI Grok API key

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

3. Create a `.env` file in the root directory and add your configuration:
```env
PORT=3000
NODE_ENV=development
GROK_API_KEY=your_grok_api_key_here
# Optional overrides:
# GROK_API_URL=https://api.x.ai/v1/responses
# GROK_MODEL=grok-4
# GROK_PROXY_URL=http://127.0.0.1:7890
```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. The server will start on `http://localhost:3000`

## Environment Variables

- `PORT` - Port number the server will run on (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `GROK_API_KEY` - xAI Grok API key (required)
- `GROK_API_URL` - Optional override for Grok API endpoint (default: SDK default)
- `GROK_MODEL` - Optional default Grok model (default: `grok-4`)
- `GROK_PROXY_URL` - Optional HTTPS proxy URL for outbound Grok calls

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

## API Endpoint

### Refactor Code

**POST** `/api/grok/refactor`

**Body**
```json
{
  "code": "function add(a, b) { return a + b; }",
  "instruction": "Add inline comments and refactor for readability",
  "model": "grok-4"
}
```

**Response**
```json
{
  "status": "success",
  "data": {
    "processedCode": "// refined code snippet..."
  }
}
```

> `instruction` and `model` are optional. When omitted, defaults set in the service/environment will be used.

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
- Powered by xAI Grok
- Error handling with custom middleware
