"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsService = void 0;
const logger_1 = require("../utils/logger");
class AgentsService {
    constructor() {
        this.apiUrl = process.env.AGENTS_API_URL || 'https://agents-api.doodles.app';
        this.agents = [
            {
                id: "af5504a3-406e-0064-8ebb-22b7c1fca166",
                name: "Deysi the Verdant Vibe",
                avatar: "https://core-storage.doodles.app/agents/deysi.png",
                bio: "Shifts between enchantress and chaos mode depending on her mood. Can be flirtatious, radiant—or sardonic and vengeful with no warning. A fashion and energy icon in the Doodleverse, impossible to ignore."
            },
            {
                id: "b91b282c-b14a-0c3b-89da-bc535285117a",
                name: "Doug Hermlin",
                avatar: "https://core-storage.doodles.app/agents/doug.png",
                bio: "He has worked at Data-Bo-Data for 14 years and has never once spilled coffee. He does not drink coffee. Doug finds peace in process. Fulfillment in formatting. Quiet joy in quarterly reports that balance on the first pass."
            },
            {
                id: "c31ed031-8e65-0d9f-9c4c-fa22bf3ac89a",
                name: "Maxine Klintz",
                avatar: "https://core-storage.doodles.app/agents/maxine.png",
                bio: "Senior Field Compliance Officer for DreamPump. She rarely leaves the DreamPump campus—unless something potentially irregular has occurred. Her job is inspection, containment, and escalation—when necessary."
            },
            {
                id: "89b30336-e318-00ba-89d5-392b23085f7b",
                name: "Kyle the Keeper",
                avatar: "https://core-storage.doodles.app/agents/kyle.png",
                bio: "After a Joygu containment breach in Dullsville, Kyle followed a dripping rainbow into a swirling rift. Now fully exiled from the gray world, he wanders the Doodleverse as a mad oracle of misplaced systems."
            }
        ];
    }
    async generateAgentResponse(processedActivity, agentId) {
        try {
            const selectedAgent = agentId
                ? this.agents.find(a => a.id === agentId) || this.selectAgentByActivity(processedActivity)
                : this.selectAgentByActivity(processedActivity);
            logger_1.logger.info(`Generating response with agent: ${selectedAgent.name}`);
            const message = await this.generatePersonalizedMessage(selectedAgent, processedActivity);
            const insights = this.generatePersonalityInsights(selectedAgent, processedActivity);
            const tone = this.determineResponseTone(selectedAgent, processedActivity);
            return {
                agent: selectedAgent,
                message,
                personality_insights: insights,
                tone
            };
        }
        catch (error) {
            logger_1.logger.error('Error generating agent response:', error);
            // Fallback to Doug for consistency
            const fallbackAgent = this.agents[1]; // Doug
            return {
                agent: fallbackAgent,
                message: "Systems operational. All metrics within acceptable parameters. Please continue with scheduled activities.",
                personality_insights: ["Consistent workflow patterns detected", "Recommend maintaining current productivity protocols"],
                tone: 'strict'
            };
        }
    }
    selectAgentByActivity(processedActivity) {
        // Select agent based on activity patterns and productivity score
        const score = processedActivity.productivity_score;
        const category = processedActivity.category;
        const focusPeriods = processedActivity.focus_periods.length;
        // Deysi for creative/chaotic patterns
        if (category === 'research' && score < 60) {
            return this.agents[0]; // Deysi - chaos mode for unfocused research
        }
        // Doug for structured development work
        if (category === 'development' && score >= 80) {
            return this.agents[1]; // Doug - loves organized productivity
        }
        // Maxine for compliance/focus enforcement
        if (score < 50 || focusPeriods < 2) {
            return this.agents[2]; // Maxine - enforcement mode
        }
        // Kyle for cryptic insights on mixed activities
        if (category === 'mixed' || processedActivity.time_spent > 480) {
            return this.agents[3]; // Kyle - oracle of scattered work
        }
        // Default to Doug for unknown patterns
        return this.agents[1];
    }
    async generatePersonalizedMessage(agent, activity) {
        const agentName = agent.name;
        switch (agent.id) {
            case "af5504a3-406e-0064-8ebb-22b7c1fca166": // Deysi
                return this.generateDeysisMessage(activity);
            case "b91b282c-b14a-0c3b-89da-bc535285117a": // Doug
                return this.generateDougsMessage(activity);
            case "c31ed031-8e65-0d9f-9c4c-fa22bf3ac89a": // Maxine
                return this.generateMaxinesMessage(activity);
            case "89b30336-e318-00ba-89d5-392b23085f7b": // Kyle
                return this.generateKylesMessage(activity);
            default:
                return "Standard productivity analysis complete.";
        }
    }
    generateDeysisMessage(activity) {
        if (activity.productivity_score >= 80) {
            return `*Chromatic shimmer* Oh darling, look at you absolutely BLOOMING with productivity! ${activity.productivity_score}% efficiency? You're practically radiating success vibes. Petals up! 🌸✨`;
        }
        else if (activity.productivity_score < 50) {
            return `*Mood shift detected* Honey, your focus is more scattered than my pollen trail right now. ${activity.productivity_score}% productivity? We need some chaos magic intervention, stat! Time to shake things up! 🍃⚡`;
        }
        else {
            return `*Balanced energy* Not bad, not bad... but we could add some SPARKLE to this ${activity.productivity_score}% score. Let's turn up the enchantment level, shall we? ✨🌿`;
        }
    }
    generateDougsMessage(activity) {
        const hours = Math.floor(activity.time_spent / 60);
        const minutes = activity.time_spent % 60;
        return `Activity report processed successfully. Total time logged: ${hours}h ${minutes}m. Productivity index: ${activity.productivity_score}/100. ${activity.focus_periods.length} focus periods documented. All metrics filed appropriately. Recommend maintaining current operational parameters for optimal quarterly performance.`;
    }
    generateMaxinesMessage(activity) {
        if (activity.productivity_score < 60) {
            return `*Heavy footsteps approach* We've detected irregularities in your productivity metrics. ${activity.productivity_score}% is below acceptable thresholds. Immediate compliance adjustments required. Focus enforcement protocols are now active.`;
        }
        else {
            return `Productivity scan complete. ${activity.productivity_score}% efficiency meets DreamPump standards. ${activity.focus_periods.length} focus periods logged. Continue current operational protocols. Next inspection scheduled as needed.`;
        }
    }
    generateKylesMessage(activity) {
        const crypticInsights = [
            `I've seen the data streams... ${activity.productivity_score}% echoes through the void...`,
            `Your ${activity.category} work creates ripples in the metadata ocean... ${activity.focus_periods.length} fragments of focused reality detected...`,
            `*Barcode eyes flicker* The patterns speak of ${Math.floor(activity.time_spent / 60)} hours traversing digital dimensions...`,
            `*Whispers from the archive depths* The efficiency metrics dance like wild doopies... ${activity.productivity_score}% harmony achieved with chaos...`
        ];
        return crypticInsights[Math.floor(Math.random() * crypticInsights.length)];
    }
    generatePersonalityInsights(agent, activity) {
        const insights = [];
        switch (agent.id) {
            case "af5504a3-406e-0064-8ebb-22b7c1fca166": // Deysi
                insights.push("Creative chaos energy detected in your workflow");
                insights.push("Consider adding more spontaneous breaks for inspiration");
                break;
            case "b91b282c-b14a-0c3b-89da-bc535285117a": // Doug
                insights.push("Systematic approach to task management observed");
                insights.push("Process optimization opportunities identified");
                break;
            case "c31ed031-8e65-0d9f-9c4c-fa22bf3ac89a": // Maxine
                insights.push("Compliance protocols require attention");
                insights.push("Focus discipline enforcement recommended");
                break;
            case "89b30336-e318-00ba-89d5-392b23085f7b": // Kyle
                insights.push("Hidden patterns in your digital wanderings revealed");
                insights.push("The archives whisper of untapped potential");
                break;
        }
        return insights;
    }
    determineResponseTone(agent, activity) {
        switch (agent.id) {
            case "af5504a3-406e-0064-8ebb-22b7c1fca166": // Deysi
                return activity.productivity_score < 50 ? 'chaotic' : 'playful';
            case "b91b282c-b14a-0c3b-89da-bc535285117a": // Doug
                return 'encouraging';
            case "c31ed031-8e65-0d9f-9c4c-fa22bf3ac89a": // Maxine
                return 'strict';
            case "89b30336-e318-00ba-89d5-392b23085f7b": // Kyle
                return 'cryptic';
            default:
                return 'encouraging';
        }
    }
    getAvailableAgents() {
        return this.agents;
    }
    getAgentById(id) {
        return this.agents.find(agent => agent.id === id);
    }
}
exports.AgentsService = AgentsService;
//# sourceMappingURL=agentsService.js.map