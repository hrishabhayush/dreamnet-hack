"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const config_1 = require("../config");
class Logger {
    constructor() {
        this.logLevel = config_1.config.logging.level || 'info';
    }
    error(message, ...args) {
        if (this.shouldLog('error')) {
            console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
        }
    }
    warn(message, ...args) {
        if (this.shouldLog('warn')) {
            console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
        }
    }
    info(message, ...args) {
        if (this.shouldLog('info')) {
            console.info(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
        }
    }
    debug(message, ...args) {
        if (this.shouldLog('debug')) {
            console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
        }
    }
    shouldLog(level) {
        const levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
        };
        return levels[level] <= levels[this.logLevel];
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map