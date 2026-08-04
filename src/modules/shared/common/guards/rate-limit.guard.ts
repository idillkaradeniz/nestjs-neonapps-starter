import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RedisService } from '../../redis/redis.service';

const WINDOW_SECONDS = 60;
const LIMIT = 10;

// Hand-rolled fixed-window limiter — deliberately NOT atomic (INCR then
// EXPIRE as two separate Redis round trips). This is the Day 10 morning
// exercise: feel the race condition risk before reaching for a library
// that solves it properly. Retired in favor of @nestjs/throttler once
// the afternoon config lands — see task notes.
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const ip = request.ip ?? 'unknown';
    const route = request.route?.path ?? request.path;
    const key = `rate:${ip}:${route}`;

    // Two separate steps, on purpose — this is the exact race condition
    // we talked through: if the process crashes between these two lines,
    // this key ends up with a count but no TTL, and never resets.
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, WINDOW_SECONDS);
    }

    if (count > LIMIT) {
      response.setHeader('Retry-After', String(WINDOW_SECONDS));
      throw new HttpException(
        {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, try again later',
        },
        429,
      );
    }

    return true;
  }
}
