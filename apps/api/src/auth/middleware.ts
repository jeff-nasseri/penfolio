import type { NextFunction, Request, Response } from 'express';
import { unauthorized } from '../util/http';
import { verifyToken } from './jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  const cookieToken = (req as Request & { cookies?: Record<string, string> }).cookies?.token;
  return cookieToken ?? null;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) return next(unauthorized());
  try {
    req.userId = verifyToken(token).sub;
    next();
  } catch {
    next(unauthorized('Invalid or expired session'));
  }
}
