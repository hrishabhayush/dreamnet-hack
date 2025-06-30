import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
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