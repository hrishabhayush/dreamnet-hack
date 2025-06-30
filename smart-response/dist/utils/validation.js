"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
exports.validateActivityData = validateActivityData;
exports.validateEnvironment = validateEnvironment;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
function validateActivityData(data) {
    if (!Array.isArray(data)) {
        throw new ValidationError('Activity data must be an array');
    }
    if (data.length === 0) {
        throw new ValidationError('Activity data cannot be empty');
    }
    return data.map((item, index) => {
        if (!item || typeof item !== 'object') {
            throw new ValidationError(`Activity item at index ${index} must be an object`);
        }
        const required = ['id', 'timestamp', 'app', 'title', 'duration'];
        for (const field of required) {
            if (!(field in item)) {
                throw new ValidationError(`Missing required field '${field}' at index ${index}`);
            }
        }
        if (typeof item.duration !== 'number' || item.duration < 0) {
            throw new ValidationError(`Invalid duration at index ${index}`);
        }
        if (!isValidTimestamp(item.timestamp)) {
            throw new ValidationError(`Invalid timestamp at index ${index}`);
        }
        return {
            id: String(item.id),
            timestamp: String(item.timestamp),
            app: String(item.app),
            title: String(item.title),
            url: item.url ? String(item.url) : undefined,
            duration: Number(item.duration),
            category: item.category ? String(item.category) : undefined,
        };
    });
}
function isValidTimestamp(timestamp) {
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
}
function validateEnvironment() {
    const required = ['OPENAI_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new ValidationError(`Missing required environment variables: ${missing.join(', ')}`);
    }
}
//# sourceMappingURL=validation.js.map