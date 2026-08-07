import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RAW_RESPONSE_KEY } from '../decorators/raw-response.decorator';
import { isCacheEnvelope } from '../cache/cache-envelope.interface';

// Wraps every successful response in { success: true, data } so the
// client has one universal shape to check, mirroring how
// HttpExceptionFilter wraps every failure in { success: false, error }.
// Routes marked with @RawResponse() (e.g. health checks whose response
// shape is dictated by infrastructure tooling) are passed through as-is.
// Day 12: if CacheInterceptor already wrapped the payload in a
// CacheEnvelope, unwrap it here and surface isCached/cachedAt as `meta`
// — this interceptor stays the ONLY place that shapes the final body,
// CacheInterceptor never needs to know about the envelope format.
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  unknown
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<unknown> {
    const isRaw = this.reflector.get<boolean>(
      RAW_RESPONSE_KEY,
      context.getHandler(),
    );
    if (isRaw) return next.handle();

    return next.handle().pipe(
      map((data) => {
        if (isCacheEnvelope(data)) {
          return {
            success: true as const,
            data: data.data,
            meta: data.meta,
          };
        }
        return { success: true as const, data };
      }),
    );
  }
}
