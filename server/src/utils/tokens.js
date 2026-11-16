import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    config.jwt.accessSecret,
    {
      expiresIn: config.jwt.accessExpires,
    }
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpires,
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}
