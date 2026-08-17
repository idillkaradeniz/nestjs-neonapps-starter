import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums';

// Marks a route handler as requiring one of the given roles. Read by
// RolesGuard via Reflector — same SetMetadata pattern as @Public().
// Runs AFTER JwtAuthGuard resolves request.user, so RolesGuard can
// trust request.user.role is already populated by then.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
