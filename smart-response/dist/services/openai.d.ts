import { ProcessedActivity } from '../types';
export declare class OpenAIService {
    private client;
    constructor();
    generateInsights(processedActivity: ProcessedActivity): Promise<string>;
    private buildPrompt;
}
//# sourceMappingURL=openai.d.ts.map