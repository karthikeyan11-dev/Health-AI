import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@shared/utils/token.util';
import { UnauthorizedError } from '@shared/errors/httpErrors';
import { logger } from '@config/logger';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization || (req.headers.Authorization as string);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or malformed');
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new UnauthorizedError('Authentication token missing');
    }

    const payload = verifyAccessToken(token);
    (req as Request & { user?: { id: string; email: string; role: string } }).user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    logger.warn({ err: error }, 'auth.middleware - Token authentication failed');
    next(
      new UnauthorizedError('Your session has expired or token is invalid. Please log in again.'),
    );
  }
}
