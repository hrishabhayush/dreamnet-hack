"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseGenerator = void 0;
const openai_1 = require("./openai");
const agentsService_1 = require("./agentsService");
const logger_1 = require("../utils/logger");
class ResponseGenerator {
    constructor() {
        this.openaiService = new openai_1.OpenAIService();
        this.agentsService = new agentsService_1.AgentsService();
    }
    async generateResponse(processedActivity, agentId) {
        try {
            logger_1.logger.info('Generating smart response with personality-driven insights');
            // Get agent-based response (primary)
            const agentResponse = await this.agentsService.generateAgentResponse(processedActivity, agentId);
            // Get AI-generated insights (supplementary)
            const aiInsights = await this.openaiService.generateInsights(processedActivity);
            // Generate structured response with agent personality
            const response = {
                insights: agentResponse.message,
                recommendations: this.enhanceRecommendationsWithPersonality(processedActivity.recommendations, agentResponse.agent.name),
                productivity_tips: this.generatePersonalityTips(processedActivity, agentResponse.agent.name),
                focus_score: this.calculateFocusScore(processedActivity),
                summary: this.generatePersonalizedSummary(processedActivity, agentResponse.agent.name),
                agent_response: agentResponse,
            };
            return response;
        }
        catch (error) {
            logger_1.logger.error('Error generating smart response:', error);
            throw error;
        }
    }
    enhanceRecommendationsWithPersonality(baseRecommendations, agentName) {
        const enhancedRecommendations = [...baseRecommendations];
        // Add time-based recommendations with personality
        const currentHour = new Date().getHours();
        switch (agentName) {
            case 'Deysi the Verdant Vibe':
                if (currentHour < 10) {
                    enhancedRecommendations.push('Morning magic time! Channel that fresh energy into your most creative challenges ✨');
                }
                else if (currentHour > 15) {
                    enhancedRecommendations.push('Afternoon vibes are perfect for collaboration and spreading those good productivity vibes! 🌸');
                }
                break;
            case 'Doug Hermlin':
                if (currentHour < 10) {
                    enhancedRecommendations.push('Early morning hours optimal for processing high-priority tasks according to quarterly efficiency standards');
                }
                else if (currentHour > 15) {
                    enhancedRecommendations.push('Post-lunch productivity window suitable for collaborative activities and administrative tasks');
                }
                break;
            case 'Maxine Klintz':
                if (currentHour < 10) {
                    enhancedRecommendations.push('Morning compliance window: Execute most critical tasks before distractions accumulate');
                }
                else if (currentHour > 15) {
                    enhancedRecommendations.push('Afternoon enforcement period: Schedule collaborative work but maintain focus protocols');
                }
                break;
            case 'Kyle the Keeper':
                if (currentHour < 10) {
                    enhancedRecommendations.push('*Dawn whispers* The early streams flow clearest... tackle the mysterious tasks while the digital realm sleeps...');
                }
                else if (currentHour > 15) {
                    enhancedRecommendations.push('*Afternoon oracle* The metadata shifts... collaborative energies align in the post-meridiem dimensions...');
                }
                break;
            default:
                if (currentHour < 10) {
                    enhancedRecommendations.push('Consider starting with your most challenging tasks early in the morning');
                }
                else if (currentHour > 15) {
                    enhancedRecommendations.push('Afternoon is great for collaborative work and meetings');
                }
        }
        return enhancedRecommendations;
    }
    generatePersonalityTips(processedActivity, agentName) {
        const tips = [];
        switch (agentName) {
            case 'Deysi the Verdant Vibe':
                if (processedActivity.focus_periods.length < 2) {
                    tips.push('Time to bloom in bursts! Try 25-minute focus sprints with 5-minute dance breaks 💃');
                }
                if (processedActivity.productivity_score < 70) {
                    tips.push('Block those digital distractions, darling! Your focus deserves to flourish ✨');
                    tips.push('Set enchanting notifications for emails - check them at magical intervals, not constantly!');
                }
                tips.push('Create a chromatic workspace that sparks joy and creativity 🌈');
                break;
            case 'Doug Hermlin':
                if (processedActivity.focus_periods.length < 2) {
                    tips.push('Implement standardized 25-minute work blocks with 5-minute intervals for optimal efficiency');
                }
                if (processedActivity.productivity_score < 70) {
                    tips.push('Deploy website restriction protocols during designated focus periods');
                    tips.push('Establish scheduled communication windows: 9 AM, 1 PM, and 4 PM for email processing');
                }
                tips.push('Utilize time-blocking methodology for systematic task allocation across daily operations');
                break;
            case 'Maxine Klintz':
                if (processedActivity.focus_periods.length < 2) {
                    tips.push('Enforce strict 25-minute focus blocks. No exceptions. Compliance is mandatory.');
                }
                if (processedActivity.productivity_score < 70) {
                    tips.push('Implement immediate digital distraction containment measures');
                    tips.push('Restrict communication access to predetermined inspection intervals');
                }
                tips.push('Maintain productivity surveillance logs to identify efficiency irregularities');
                break;
            case 'Kyle the Keeper':
                if (processedActivity.focus_periods.length < 2) {
                    tips.push('*Archive whispers* Fragment your work into 25-minute reality shards... separated by 5-minute void-walks...');
                }
                if (processedActivity.productivity_score < 70) {
                    tips.push('*Barcode flicker* Seal the distraction portals during focus ceremonies...');
                    tips.push('*Cryptic wisdom* The communication streams must flow only at designated coordinates...');
                }
                tips.push('*Oracle vision* Log your productivity patterns... the metadata remembers all...');
                break;
            default:
                if (processedActivity.focus_periods.length < 2) {
                    tips.push('Try the Pomodoro technique: 25 minutes focused work, 5 minute break');
                }
                if (processedActivity.productivity_score < 70) {
                    tips.push('Consider using website blockers during focus time');
                    tips.push('Set specific times for checking emails and messages');
                }
                tips.push('Use time-blocking to allocate specific hours for different types of work');
        }
        if (processedActivity.time_spent > 480) { // More than 8 hours
            tips.push(this.getOverworkTipByAgent(agentName));
        }
        return tips;
    }
    getOverworkTipByAgent(agentName) {
        switch (agentName) {
            case 'Deysi the Verdant Vibe':
                return 'Whoa there, workaholic! Even enchantresses need rest to keep their magic sparkling ✨';
            case 'Doug Hermlin':
                return 'Extended operational periods detected. Implement mandatory rest intervals to maintain quarterly performance standards';
            case 'Maxine Klintz':
                return 'Excessive work duration noted. Break protocols are required to prevent productivity degradation';
            case 'Kyle the Keeper':
                return '*Archive concern* Too long in the digital streams... return to physical realm for restoration...';
            default:
                return 'Remember to take regular breaks to maintain productivity';
        }
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
    generatePersonalizedSummary(processedActivity, agentName) {
        const hours = Math.floor(processedActivity.time_spent / 60);
        const minutes = processedActivity.time_spent % 60;
        const baseSummary = `Today you spent ${hours}h ${minutes}m on ${processedActivity.category} activities with ${processedActivity.focus_periods.length} focus periods.`;
        switch (agentName) {
            case 'Deysi the Verdant Vibe':
                return `${baseSummary} Your productivity garden bloomed at ${processedActivity.productivity_score}%! ✨🌸`;
            case 'Doug Hermlin':
                return `${baseSummary} Productivity index achieved: ${processedActivity.productivity_score}/100. Performance metrics documented and filed.`;
            case 'Maxine Klintz':
                return `${baseSummary} Efficiency rating: ${processedActivity.productivity_score}%. Compliance status determined.`;
            case 'Kyle the Keeper':
                return `${baseSummary} *Archive notation* ${processedActivity.productivity_score}% harmony achieved between chaos and order...`;
            default:
                return `${baseSummary} Your productivity score was ${processedActivity.productivity_score}/100.`;
        }
    }
    // Method to get available agents
    getAvailableAgents() {
        return this.agentsService.getAvailableAgents();
    }
}
exports.ResponseGenerator = ResponseGenerator;
//# sourceMappingURL=responseGenerator.js.map