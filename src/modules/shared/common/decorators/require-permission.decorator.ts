import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums';

// Same SetMetadata pattern as @Roles(), but for fine-grained capabilities
// instead of a whole role. Read by PermissionGuard via Reflector, which
// looks up request.user.role in ROLE_PERMISSIONS to see if it grants
// every permission listed here. Runs AFTER JwtAuthGuard (needs
// request.user) — order enforced in auth.module.ts's providers array.
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
