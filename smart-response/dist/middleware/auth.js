"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
function authMiddleware(req, res, next) {
    // For now, just pass through - can be enhanced later with JWT/API key auth
    const apiKey = req.headers['x-api-key'];
    if (process.env.NODE_ENV === 'production' && !apiKey) {
        res.status(401).json({
            success: false,
            error: 'API key required',
            timestamp: new Date().toISOString(),
        });
        return;
    }
    // In a real implementation, you would validate the API key here
    // For now, just set a default user ID
    req.userId = 'default-user';
    next();
}
//# sourceMappingURL=auth.js.map