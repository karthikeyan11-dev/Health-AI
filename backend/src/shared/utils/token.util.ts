import jwt from 'jsonwebtoken';
import { Config } from '@config/env.config';
import type { AuthTokensResponse } from '@modules/auth/auth.dto';

export type TokenPayload = {
  userId: string;
  email: string;
  role: string;
};

/**
 * Generates JWT access and refresh token pair adhering to AuthTokensResponse schema.
 */
export function generateTokens(payload: TokenPayload): AuthTokensResponse {
  const accessToken = jwt.sign(payload, Config.JWT_SECRET, {
    expiresIn: Config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign({ userId: payload.userId }, Config.JWT_REFRESH_SECRET, {
    expiresIn: Config.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: 3600,
  };
}

/**
 * Verifies JWT access token and returns decoded TokenPayload.
 */
export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, Config.JWT_SECRET) as TokenPayload & jwt.JwtPayload;
  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  };
}
