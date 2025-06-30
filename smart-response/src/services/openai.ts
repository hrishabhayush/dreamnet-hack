import OpenAI from 'openai';
import { config } from '../config';
import { logger } from '../utils/logger';
import { ProcessedActivity } from '../types';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async generateInsights(processedActivity: ProcessedActivity): Promise<string> {
    try {
      const prompt = this.buildPrompt(processedActivity);
      
      const completion = await this.client.chat.completions.create({
        model: config.openai.model,
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
        max_tokens: config.openai.maxTokens,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response generated from OpenAI');
      }

      return response;
    } catch (error) {
      logger.error('Error generating insights from OpenAI:', error);
      throw error;
    }
  }

  private buildPrompt(processedActivity: ProcessedActivity): string {
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