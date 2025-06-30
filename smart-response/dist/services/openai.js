"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
const openai_1 = __importDefault(require("openai"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
class OpenAIService {
    constructor() {
        this.client = new openai_1.default({
            apiKey: config_1.config.openai.apiKey,
        });
    }
    async generateInsights(processedActivity) {
        try {
            const prompt = this.buildPrompt(processedActivity);
            const completion = await this.client.chat.completions.create({
                model: config_1.config.openai.model,
                messages: [
                    {
                        role: "system",
                        content: "You are a productivity assistant that analyzes work patterns and provides helpful insights and recommendations."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: config_1.config.openai.maxTokens,
                temperature: 0.7,
            });
            const response = completion.choices[0]?.message?.content;
            if (!response) {
                throw new Error('No response generated from OpenAI');
            }
            return response;
        }
        catch (error) {
            logger_1.logger.error('Error generating insights from OpenAI:', error);
            throw error;
        }
    }
    buildPrompt(processedActivity) {
        return `
Analyze the following work activity data and provide insights:

Summary: ${processedActivity.summary}
Productivity Score: ${processedActivity.productivity_score}/100
Category: ${processedActivity.category}
Time Spent: ${processedActivity.time_spent} minutes
Focus Periods: ${processedActivity.focus_periods.length}

Current Recommendations: ${processedActivity.recommendations.join(', ')}

Please provide:
1. Key insights about the work patterns
2. Specific recommendations for improvement
3. Productivity tips based on the data
4. An overall assessment of focus and productivity

Format your response as a clear, actionable analysis.
    `.trim();
    }
}
exports.OpenAIService = OpenAIService;
//# sourceMappingURL=openai.js.map