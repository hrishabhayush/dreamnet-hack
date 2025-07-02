import { DoodleAgent, AgentResponse, ProcessedActivity } from '../types';
export declare class AgentsService {
    private apiUrl;
    private agents;
    constructor();
    generateAgentResponse(processedActivity: ProcessedActivity, agentId?: string): Promise<AgentResponse>;
    private selectAgentByActivity;
    private generatePersonalizedMessage;
    private generateDeysisMessage;
    private generateDougsMessage;
    private generateMaxinesMessage;
    private generateKylesMessage;
    private generatePersonalityInsights;
    private determineResponseTone;
    getAvailableAgents(): DoodleAgent[];
    getAgentById(id: string): DoodleAgent | undefined;
}
//# sourceMappingURL=agentsService.d.ts.map