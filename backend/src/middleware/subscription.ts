import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export function requirePlus(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Nicht authentifiziert' });
  }
  if (req.user.subscriptionTier !== 'plus') {
    return res.status(403).json({
      success: false,
      error: 'WorldPoliticsNews Plus erforderlich',
      code: 'PLUS_REQUIRED',
    });
  }
  next();
}
