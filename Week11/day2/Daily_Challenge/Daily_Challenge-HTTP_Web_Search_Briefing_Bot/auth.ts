// src/middleware/auth.ts
import type { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';

export function requireBearerToken(req: Request, res: Response, next: NextFunction): void {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing Authorization: Bearer <token> header.' });
    return;
  }

  const token = header.slice('Bearer '.length);
  if (token !== config.mcpHttpToken) {
    res.status(401).json({ error: 'Invalid bearer token.' });
    return;
  }

  next();
}
