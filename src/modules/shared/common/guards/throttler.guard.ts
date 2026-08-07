import {
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';

// @nestjs/throttler's default 429 body ({ statusCode, message }) doesn't
// match our Day 5 envelope ({ code, message }) — HttpExceptionFilter would
// fall back to the generic HTTP_ERROR code for it. Override just the
// throw site so a rate-limited request still gets RATE_LIMIT_EXCEEDED and
// a Retry-After header, same contract as every other error in this API.
//
// Note (Day 10): hand-rolled INCR + EXPIRE isn't atomic — two separate
// commands, so writing it by hand can race and produce bugs; the library
// keeps them atomic, cutting both error risk and time cost.
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(AppThrottlerGuard.name);

  // Day 12: rate limiting depends on Redis (the throttler storage). If
  // Redis is down, canActivate() throws a connection error — letting
  // that propagate would 500 EVERY request app-wide, because this guard
  // runs globally before anything else. A broken safety feature must
  // not take down the feature it protects: catch, log, and let the
  // request through unthrottled rather than fail the whole app. A real
  // throttling exception (429, limit actually exceeded) is NOT a Redis
  // failure — that one still throws normally.
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return await super.canActivate(context);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      this.logger.warn(
        `Redis unavailable, skipping rate limit check: ${(err as Error).message}`,
      );
      return true;
    }
  }

  protected override async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    // void-ok — base class signature requires it
    const { res } = this.getRequestResponse(context);
    const retryAfterSeconds = Math.ceil(throttlerLimitDetail.timeToExpire);
    res.setHeader('Retry-After', String(retryAfterSeconds));

    throw new HttpException(
      {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, try again later',
      },
      429,
    );
  }
}
