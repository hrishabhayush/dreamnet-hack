"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const activityProcessor_1 = require("./services/activityProcessor");
const responseGenerator_1 = require("./services/responseGenerator");
const validation_1 = require("./utils/validation");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Initialize services
const activityProcessor = new activityProcessor_1.ActivityProcessor();
const responseGenerator = new responseGenerator_1.ResponseGenerator();
// Validate environment on startup
try {
    (0, validation_1.validateEnvironment)();
    logger_1.logger.info('Environment validation passed');
}
catch (error) {
    logger_1.logger.error('Environment validation failed:', error);
    process.exit(1);
}
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            activityProcessor: 'ready',
            responseGenerator: 'ready',
            agents: 'ready'
        }
    });
});
// Get available agents endpoint
app.get('/agents', (req, res) => {
    try {
        const agents = responseGenerator.getAvailableAgents();
        res.json({
            success: true,
            data: agents,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching agents:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch available agents',
            timestamp: new Date().toISOString()
        });
    }
});
// Main analysis endpoint with agent personality
app.post('/analyze', async (req, res) => {
    try {
        const { activityData, agentId } = req.body;
        if (!activityData) {
            return res.status(400).json({
                success: false,
                error: 'Activity data is required',
                timestamp: new Date().toISOString()
            });
        }
        logger_1.logger.info(`Starting analysis for ${Array.isArray(activityData) ? activityData.length : 1} activities with agent: ${agentId || 'auto-select'}`);
        // Validate and sanitize activity data
        const validatedData = (0, validation_1.validateActivityData)(activityData);
        logger_1.logger.info(`Validated ${validatedData.length} activity records`);
        // Process the activity data
        const processedActivity = await activityProcessor.process(validatedData);
        logger_1.logger.info(`Activity processing complete. Productivity score: ${processedActivity.productivity_score}%`);
        // Generate smart response with agent personality
        const smartResponse = await responseGenerator.generateResponse(processedActivity, agentId);
        logger_1.logger.info(`Smart response generated with agent: ${smartResponse.agent_response?.agent.name}`);
        res.json({
            success: true,
            data: {
                processed_activity: processedActivity,
                smart_response: smartResponse,
                metadata: {
                    total_activities: validatedData.length,
                    processing_time: new Date().toISOString(),
                    agent_used: smartResponse.agent_response?.agent.name,
                    agent_tone: smartResponse.agent_response?.tone
                }
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Error in analysis endpoint:', error);
        // Return appropriate error response
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                error: error.message,
                type: 'validation_error',
                timestamp: new Date().toISOString()
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Internal server error during analysis',
                timestamp: new Date().toISOString()
            });
        }
    }
});
// Test endpoint for quick agent testing
app.post('/test-agent', async (req, res) => {
    try {
        const { agentId } = req.body;
        // Create mock activity data for testing
        const mockActivityData = [
            {
                id: 'test-1',
                timestamp: new Date().toISOString(),
                app: 'vscode',
                title: 'Working on amazing project',
                duration: 120,
                category: 'development'
            },
            {
                id: 'test-2',
                timestamp: new Date().toISOString(),
                app: 'chrome',
                title: 'Research for project',
                duration: 45,
                category: 'research'
            }
        ];
        const processedActivity = await activityProcessor.process(mockActivityData);
        const smartResponse = await responseGenerator.generateResponse(processedActivity, agentId);
        res.json({
            success: true,
            data: {
                test_mode: true,
                mock_data: mockActivityData,
                smart_response: smartResponse
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Error in test-agent endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Error testing agent response',
            timestamp: new Date().toISOString()
        });
    }
});
const port = process.env.PORT || 3003;
app.listen(port, () => {
    console.log(`🚀 Smart Response service running on port ${port}`);
    console.log(`🤖 Agents ready: Deysi, Doug, Maxine, Kyle`);
    console.log(`📊 Analysis endpoint: POST /analyze`);
    console.log(`🎭 Test endpoint: POST /test-agent`);
    console.log(`👥 Agents list: GET /agents`);
    console.log(`❤️  Health check: GET /health`);
});
exports.default = app;
//# sourceMappingURL=index.js.map