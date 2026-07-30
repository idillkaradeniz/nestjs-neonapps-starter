import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../shared/common/decorators/require-permission.decorator';
import { Permission } from '../permission.enum';
import { ROLE_PERMISSIONS } from '../role-permissions.constant';
import { AuthErrors } from '../auth-errors.constant';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

// Registered globally via APP_GUARD, AFTER JwtAuthGuard and RolesGuard —
// by the time this guard runs, request.user is populated and any
// @Roles() check has already passed. This guard is a second, finer-
// grained layer: it looks up request.user.role in ROLE_PERMISSIONS and
// checks that every permission the route requires is in that role's set.
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    // No @RequirePermission() on this route → nothing to check here.
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    const grantedPermissions = ROLE_PERMISSIONS[request.user.role];
    const hasAll = requiredPermissions.every((permission) =>
      grantedPermissions.includes(permission),
    );
    if (!hasAll) {
      throw AuthErrors.forbiddenPermission(requiredPermissions);
    }
    return true;
  }
}
