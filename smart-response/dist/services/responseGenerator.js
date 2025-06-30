"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseGenerator = void 0;
const openai_1 = require("./openai");
const logger_1 = require("../utils/logger");
class ResponseGenerator {
    constructor() {
        this.openaiService = new openai_1.OpenAIService();
    }
    async generateResponse(processedActivity) {
        try {
            logger_1.logger.info('Generating smart response for processed activity data');
            // Get AI-generated insights
            const aiInsights = await this.openaiService.generateInsights(processedActivity);
            // Generate structured response
            const response = {
                insights: aiInsights,
                recommendations: this.enhanceRecommendations(processedActivity.recommendations),
                productivity_tips: this.generateProductivityTips(processedActivity),
                focus_score: this.calculateFocusScore(processedActivity),
                summary: this.generateDetailedSummary(processedActivity),
            };
            return response;
        }
        catch (error) {
            logger_1.logger.error('Error generating smart response:', error);
            throw error;
        }
    }
    enhanceRecommendations(baseRecommendations) {
        const enhancedRecommendations = [...baseRecommendations];
        // Add time-based recommendations
        const currentHour = new Date().getHours();
        if (currentHour < 10) {
            enhancedRecommendations.push('Consider starting with your most challenging tasks early in the morning');
        }
        else if (currentHour > 15) {
            enhancedRecommendations.push('Afternoon is great for collaborative work and meetings');
        }
        return enhancedRecommendations;
    }
    generateProductivityTips(processedActivity) {
        const tips = [];
        if (processedActivity.focus_periods.length < 2) {
            tips.push('Try the Pomodoro technique: 25 minutes focused work, 5 minute break');
        }
        if (processedActivity.productivity_score < 70) {
            tips.push('Consider using website blockers during focus time');
            tips.push('Set specific times for checking emails and messages');
        }
        if (processedActivity.time_spent > 480) { // More than 8 hours
            tips.push('Remember to take regular breaks to maintain productivity');
        }
        tips.push('Use time-blocking to allocate specific hours for different types of work');
        tips.push('Keep a distraction log to identify your biggest productivity barriers');
        return tips;
    }
    calculateFocusScore(processedActivity) {
        const highQualityPeriods = processedActivity.focus_periods.filter(p => p.quality === 'high').length;
        const totalPeriods = processedActivity.focus_periods.length;
        if (totalPeriods === 0)
            return 0;
        const focusQualityScore = (highQualityPeriods / totalPeriods) * 100;
        const productivityWeight = processedActivity.productivity_score * 0.7;
        const focusWeight = focusQualityScore * 0.3;
        return Math.round(productivityWeight + focusWeight);
    }
    generateDetailedSummary(processedActivity) {
        const hours = Math.floor(processedActivity.time_spent / 60);
        const minutes = processedActivity.time_spent % 60;
        return `
Today you spent ${hours}h ${minutes}m on ${processedActivity.category} activities. 
Your productivity score was ${processedActivity.productivity_score}/100 with ${processedActivity.focus_periods.length} focus periods. 
${processedActivity.summary}
    `.trim();
    }
}
exports.ResponseGenerator = ResponseGenerator;
//# sourceMappingURL=responseGenerator.js.map