import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '../lib/redis';
import { Request, Response, NextFunction } from 'express';

const opts = {
  storeClient: redis,
  keyPrefix: 'rlflx',
  points: 10, // requests
  duration: 1 // per second
};

const rateLimiter = new RateLimiterRedis(opts);

export function expressRateLimiter(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || 'unknown'; // or use user id for auth'd routes

  rateLimiter.consume(key)
    .then(() => next())
    .catch(() => res.status(429).json({ message: 'Too many requests' }));
}
