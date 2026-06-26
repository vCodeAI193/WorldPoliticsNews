import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; subscriptionTier: string };
  admin?: { id: string; userId: string; role: string; createdAt: Date };
}

interface JwtPayload {
  sub: string;
  email: string;
  tier: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Nicht authentifiziert' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = { id: payload.sub, email: payload.email, subscriptionTier: payload.tier };
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Token ungültig oder abgelaufen' });
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Nicht authentifiziert' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = { id: payload.sub, email: payload.email, subscriptionTier: payload.tier };
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Token ungültig oder abgelaufen' });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = { id: payload.sub, email: payload.email, subscriptionTier: payload.tier };
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}
