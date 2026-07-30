import { Permission } from './permission.enum';
import { UserRole } from '../user/users/user-role.enum';

// The single source of truth for "what can each role do." PermissionGuard
// looks a user's role up in this map at request time — so promoting what
// MODERATOR can do later is a one-line change here, not a hunt through
// every route that uses @RequirePermission.
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_MANAGE_ROLES,
  ],
  [UserRole.MODERATOR]: [Permission.USER_READ, Permission.USER_UPDATE],
  [UserRole.USER]: [],
};
