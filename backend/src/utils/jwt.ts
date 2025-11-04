import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type JwtPayload = { userId: string };

export function signJwt(payload: any): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

export function verifyJwt(token: string): any {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new Error('Invalid token');
  }
}


