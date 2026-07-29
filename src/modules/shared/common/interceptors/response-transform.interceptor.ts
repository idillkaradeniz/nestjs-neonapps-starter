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

// Wraps every successful response in { success: true, data } so the
// client has one universal shape to check, mirroring how
// HttpExceptionFilter wraps every failure in { success: false, error }.
// Routes marked with @RawResponse() (e.g. health checks whose response
// shape is dictated by infrastructure tooling) are passed through as-is.
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  T | { success: true; data: T }
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<T | { success: true; data: T }> {
    const isRaw = this.reflector.get<boolean>(
      RAW_RESPONSE_KEY,
      context.getHandler(),
    );
    if (isRaw) return next.handle();

    return next
      .handle()
      .pipe(map((data) => ({ success: true as const, data })));
  }
}
