import { ProcessedActivity, SmartResponse } from '../types';
export declare class ResponseGenerator {
    private openaiService;
    private agentsService;
    constructor();
    generateResponse(processedActivity: ProcessedActivity, agentId?: string): Promise<SmartResponse>;
    private enhanceRecommendationsWithPersonality;
    private generatePersonalityTips;
    private getOverworkTipByAgent;
    private calculateFocusScore;
    private generatePersonalizedSummary;
    getAvailableAgents(): import("../types").DoodleAgent[];
}
//# sourceMappingURL=responseGenerator.d.ts.map