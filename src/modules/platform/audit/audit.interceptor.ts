import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { requestContext } from '../../shared/common/context/request-context';
import { AuditAction } from '../../shared/common/enums';
import { AuditOptions } from './audit.decorator';
import { AUDIT_METADATA_KEY } from './audit.constants';
import { AuditService } from './audit.service';

// Day 13: reads @Audit(...) metadata (same split as CacheInterceptor —
// decorator tags, interceptor does the work). Routes without @Audit
// pass straight through untouched.
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const options = this.reflector.get<AuditOptions>(
      AUDIT_METADATA_KEY,
      context.getHandler(),
    );
    if (!options) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const actingUser = request.user as AuthenticatedUser | undefined;

    return next.handle().pipe(
      tap((data) => {
        // Every audited route sits behind JwtAuthGuard (Day 7) — this
        // should never be undefined, but an audit row needs a real
        // actor, so skip rather than write one with a fabricated id.
        if (!actingUser) return;

        const after =
          options.action === AuditAction.DELETE
            ? null
            : (data as Record<string, unknown>);
        const entityId =
          (request.params.id as string | undefined) ??
          (after?.id as string | undefined) ??
          'unknown';
        const before = requestContext.getStore()?.auditBefore ?? null;

        // Fire-and-forget: no await. An audit hiccup must never fail
        // the citizen's request — see AuditService.logChange, which
        // already catches and logs internally too.
        void this.auditService.logChange({
          action: options.action,
          entity: options.entity,
          entityId,
          before,
          after,
          performedBy: actingUser.id,
        });
      }),
    );
  }
}
