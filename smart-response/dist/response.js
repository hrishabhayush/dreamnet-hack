"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middleware/errorHandler");
const responseGenerator_1 = require("./services/responseGenerator");
const activityProcessor_1 = require("./services/activityProcessor");
const logger_1 = require("./utils/logger");
const config_1 = require("./config");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const responseGenerator = new responseGenerator_1.ResponseGenerator();
const activityProcessor = new activityProcessor_1.ActivityProcessor();
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Main endpoint for processing activity data and generating responses
app.post('/analyze', async (req, res, next) => {
    try {
        const { activityData } = req.body;
        if (!activityData) {
            return res.status(400).json({ error: 'Activity data is required' });
        }
        // Process the activity data
        const processedData = await activityProcessor.process(activityData);
        // Generate smart response
        const response = await responseGenerator.generateResponse(processedData);
        res.json({
            success: true,
            response,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        next(error);
    }
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
const port = config_1.config.port || 3003;
app.listen(port, () => {
    logger_1.logger.info(`Smart Response service running on port ${port}`);
});
exports.default = app;
//# sourceMappingURL=response.js.map