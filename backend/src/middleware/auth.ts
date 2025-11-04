import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { verifyJwt } from '../utils/jwt';

export type AuthedRequest = Request & { userId?: string };

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = (req as any).cookies?.[env.cookieName];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload: any = verifyJwt(token);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}


