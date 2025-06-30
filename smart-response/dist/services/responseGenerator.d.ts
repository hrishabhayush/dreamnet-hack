import { ProcessedActivity, SmartResponse } from '../types';
export declare class ResponseGenerator {
    private openaiService;
    constructor();
    generateResponse(processedActivity: ProcessedActivity): Promise<SmartResponse>;
    private enhanceRecommendations;
    private generateProductivityTips;
    private calculateFocusScore;
    private generateDetailedSummary;
}
//# sourceMappingURL=responseGenerator.d.ts.map