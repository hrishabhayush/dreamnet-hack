"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    port: parseInt(process.env.PORT || '3003'),
    openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
    },
};
// Validate required environment variables
if (!exports.config.openai.apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
}
//# sourceMappingURL=config.js.map