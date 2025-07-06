import { configDotenv } from 'dotenv';
import { Config } from './types';

configDotenv();

export const config: Config = {
  port: parseInt(process.env.PORT || '3003'),
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  agents: {
    apiUrl: process.env.AGENTS_API_URL || 'https://agents-api.doodles.app',
    miniAppId: process.env.MINI_APP_ID || '',
    miniAppSecret: process.env.MINI_APP_SECRET || '',
  },
};

// Basic validation for agent credentials – these are required for authenticated calls
if (!config.agents.miniAppId || !config.agents.miniAppSecret) {
  console.warn('[WARN] MINI_APP_ID or MINI_APP_SECRET not set. Authenticated agent calls will fail.');
} 