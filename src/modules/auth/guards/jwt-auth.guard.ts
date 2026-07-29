import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../shared/common/decorators/public.decorator';
import { AuthErrors } from '../auth-errors.constant';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

// Registered globally via APP_GUARD (see auth.module.ts) — every route
// is protected by default. A route only skips this guard if it's
// consciously marked @Public() (health, register, login, refresh).
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) {
      return true;
    }
    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  // Passport hands back (err, user, info) instead of throwing — info is
  // the raw error from passport-jwt (TokenExpiredError, JsonWebTokenError,
  // or its own "No auth token" Error when the header is missing). We
  // translate each case into our Day 5 typed DomainException instead of
  // letting Nest fall back to a generic 401.
  override handleRequest<TUser = AuthenticatedUser>(
    // boundary: validated — Passport's own done(err, user, info) callback; err is whatever the strategy threw.
    err: unknown,
    user: TUser | false,
    // boundary: validated — passport-jwt's raw error objects (TokenExpiredError / JsonWebTokenError / plain Error).
    info: unknown,
  ): TUser {
    if (err) {
      throw err;
    }
    if (!user) {
      const infoError = info as { name?: string; message?: string } | null;
      if (infoError?.name === 'TokenExpiredError') {
        throw AuthErrors.tokenExpired();
      }
      if (infoError?.message === 'No auth token') {
        throw AuthErrors.tokenMissing();
      }
      throw AuthErrors.tokenInvalid();
    }
    return user;
  }
}
