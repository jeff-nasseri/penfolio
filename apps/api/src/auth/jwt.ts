import jwt from 'jsonwebtoken';
import { env } from '../env';

export interface TokenPayload {
  sub: number;
}

export function signToken(userId: number): string {
  return jwt.sign({ sub: userId }, env.jwtSecret as jwt.Secret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret as jwt.Secret) as unknown as TokenPayload;
}
