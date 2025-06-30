# Smart Response Service

The AI-powered analysis layer for the Workpal Agent system. This service processes ActivityWatch data and generates intelligent insights using OpenAI's API.

## Project Structure

```
src/
├── index.ts                 # Main entry point (simplified)
├── types.ts                 # TypeScript type definitions
├── config.ts                # Configuration management
├── services/
│   ├── openai.ts           # OpenAI API integration
│   ├── activityProcessor.ts # ActivityWatch data processing
│   └── responseGenerator.ts # Smart response generation
├── utils/
│   ├── logger.ts           # Logging utilities
│   └── validation.ts       # Data validation helpers
└── middleware/
    ├── auth.ts             # Authentication middleware
    └── errorHandler.ts     # Error handling
```

## Setup

1. Copy `.env.example` to `.env` and fill in your OpenAI API key:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Start the service:
   ```bash
   npm start
   ```

## Development

- `npm run dev` - Run in development mode with ts-node
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start the compiled JavaScript

## API Endpoints

- `GET /health` - Health check
- `POST /analyze` - Analyze activity data and generate insights

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `OPENAI_MODEL` - OpenAI model to use (default: gpt-4)
- `OPENAI_MAX_TOKENS` - Max tokens for responses (default: 2000)
- `PORT` - Service port (default: 3003)
- `LOG_LEVEL` - Logging level (default: info) 