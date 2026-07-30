import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../shared/common/decorators/roles.decorator';
import { UserRole } from '../../user/users/user-role.enum';
import { AuthErrors } from '../auth-errors.constant';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

// Registered globally via APP_GUARD, AFTER JwtAuthGuard (order matters
// — see auth.module.ts, guards run in the order they're provided). By
// the time this guard runs, JwtAuthGuard has already resolved
// request.user, so it's safe to read user.role here.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    // No @Roles() on this route → no role restriction, authentication
    // alone (already checked by JwtAuthGuard) is enough.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    if (!requiredRoles.includes(request.user.role)) {
      throw AuthErrors.forbiddenRole(requiredRoles);
    }
    return true;
  }
}
