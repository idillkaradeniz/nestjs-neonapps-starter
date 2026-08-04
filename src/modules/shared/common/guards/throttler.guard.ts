import { ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';

// @nestjs/throttler's default 429 body ({ statusCode, message }) doesn't
// match our Day 5 envelope ({ code, message }) — HttpExceptionFilter would
// fall back to the generic HTTP_ERROR code for it. Override just the
// throw site so a rate-limited request still gets RATE_LIMIT_EXCEEDED and
// a Retry-After header, same contract as every other error in this API.

/* Hand-rolled INCR + EXPIRE isn't atomic — two separate commands
so writing it by hand can race and produce bugs; the library keeps them atomic
cutting both error risk and time cost.*/

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
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
