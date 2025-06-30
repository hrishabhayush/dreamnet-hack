"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = require("../utils/logger");
const validation_1 = require("../utils/validation");
function errorHandler(error, req, res, next) {
    logger_1.logger.error('Error occurred:', error);
    if (error instanceof validation_1.ValidationError) {
        res.status(400).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
        return;
    }
    // OpenAI API errors
    if (error.message.includes('OpenAI')) {
        res.status(502).json({
            success: false,
            error: 'AI service temporarily unavailable',
            timestamp: new Date().toISOString(),
        });
        return;
    }
    // Default error response
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
    });
}
//# sourceMappingURL=errorHandler.js.map