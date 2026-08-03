import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { Request, Response } from 'express';
import { DomainException } from '../errors/domain.exception';
import { NormalizedError } from './normalized-error.interface';
import { isStructuredErrorBody } from './structured-error-body.type-guard';

// Catches EVERY exception thrown anywhere in the app — DomainExceptions,
// Nest's own HttpExceptions (e.g. validation failures), and anything
// truly unexpected (a bug, a third-party throw) — and normalizes all of
// them into one response shape: { success: false, error: { code,
// message, details? } }. Stack traces only ever appear in the response
// in development; every 5xx is logged server-side with full request
// context regardless of environment.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const isDev = process.env.NODE_ENV === 'development';

    const normalized = this.normalize(exception, isDev);

    if (normalized.status >= 500) {
      this.logger.error('Unhandled server error', {
        code: normalized.code,
        path: request.url,
        method: request.method,
        body: request.body,
        timestamp: new Date().toISOString(),
        stack: exception instanceof Error ? exception.stack : undefined,
      });
      // Only 5xx goes to Sentry — 4xx is expected user error, not
      // something we need paged/alerted on. If SENTRY_DSN is unset,
      // this call is a silent no-op (see instrument.ts).
      Sentry.captureException(exception);
    }

    response.status(normalized.status).json({
      success: false,
      error: {
        code: normalized.code,
        message: normalized.message,
        ...(normalized.details !== undefined && {
          details: normalized.details,
        }),
      },
    });
  }

  private normalize(exception: unknown, isDev: boolean): NormalizedError {
    if (exception instanceof DomainException) {
      return {
        status: exception.definition.status,
        code: exception.definition.code,
        message: exception.message,
        details: isDev ? { params: exception.params } : undefined,
      };
    }

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (isStructuredErrorBody(body)) {
        return {
          status: exception.getStatus(),
          code: body.code,
          message: body.message,
          details: body.details,
        };
      }
      return {
        status: exception.getStatus(),
        code: 'HTTP_ERROR',
        message: exception.message,
      };
    }

    const rawMessage =
      exception instanceof Error ? exception.message : 'Unknown error';
    return {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: isDev ? rawMessage : 'Something went wrong',
      details:
        isDev && exception instanceof Error
          ? { stack: exception.stack }
          : undefined,
    };
  }
}
